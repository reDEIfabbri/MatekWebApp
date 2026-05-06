import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import MathInput from './MathInput';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function TaskCreatorTab() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [taskType, setTaskType] = useState('TEXT_ANSWER');
  const [difficulty, setDifficulty] = useState(1);
  const [taskText, setTaskText] = useState('');
  // For TEXT_ANSWER, this holds the string value.
  const [textAnswerValue, setTextAnswerValue] = useState(''); 
  // For CHOICE questions, this holds an array of indices of correct answers.
  const [correctChoiceIndices, setCorrectChoiceIndices] = useState([]); 
  
  const [choices, setChoices] = useState(['', '']); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/topics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTopics();
  }, []);

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleRemoveChoice = (index) => {
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    // Remove from correct indices if it was selected
    setCorrectChoiceIndices(correctChoiceIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleCorrectChoiceToggle = (index) => {
    if (taskType === 'SINGLE_CHOICE') {
      setCorrectChoiceIndices([index]);
    } else {
      // Multiple Choice
      if (correctChoiceIndices.includes(index)) {
        setCorrectChoiceIndices(correctChoiceIndices.filter(i => i !== index));
      } else {
        setCorrectChoiceIndices([...correctChoiceIndices, index]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (taskType !== 'TEXT_ANSWER' && correctChoiceIndices.length === 0) {
      setError('Please select at least one correct answer.');
      return;
    }

    try {
      // Determine final correct answer string to store
      let finalCorrectAnswer = '';
      if (taskType === 'TEXT_ANSWER') {
        finalCorrectAnswer = textAnswerValue;
      } else {
        // Store indices as JSON string, e.g., "[0, 2]"
        finalCorrectAnswer = JSON.stringify(correctChoiceIndices.sort());
      }

      const token = localStorage.getItem('token');
      const payload = {
        topicId: selectedTopic,
        difficulty,
        taskType,
        taskText,
        correctAnswer: finalCorrectAnswer,
        choices: (taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') ? JSON.stringify(choices) : null
      };

      const response = await fetch('http://localhost:5000/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }

      setSuccess('Task created successfully!');
      // Reset form
      setTaskText('');
      setTextAnswerValue('');
      setCorrectChoiceIndices([]);
      setChoices(['', '']);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Task</CardTitle>
        <CardDescription>Select a template and fill in the details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Top Row: Topic, Type, Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(topic => (
                    <SelectItem key={topic.topic_id} value={String(topic.topic_id)}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <Select onValueChange={(val) => { setTaskType(val); setCorrectChoiceIndices([]); }} value={taskType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT_ANSWER">Text Answer (Math)</SelectItem>
                  <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-10)</Label>
              <Input 
                id="difficulty" 
                type="number" 
                min="1" 
                max="10" 
                step="0.1"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              />
            </div>
          </div>
          
          {/* Task Text */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Task Question</Label>
            <p className="text-xs text-muted-foreground">Use the virtual keyboard to switch to text mode if needed.</p>
            <MathInput 
              value={taskText}
              onChange={setTaskText}
              className="w-full border rounded-md p-4 min-h-[120px] bg-white shadow-sm"
            />
          </div>

          {/* Dynamic Choices Section */}
          {(taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') && (
            <div className="space-y-4 border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Answer Choices</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddChoice}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Choice
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Check the box next to the correct answer(s).</p>
              
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center pt-2">
                     <Checkbox 
                        id={`correct-${index}`}
                        checked={correctChoiceIndices.includes(index)}
                        onCheckedChange={() => handleCorrectChoiceToggle(index)}
                     />
                  </div>
                  <Label htmlFor={`correct-${index}`} className="flex-none w-6 text-center font-bold text-gray-500 pt-2 cursor-pointer">
                    {String.fromCharCode(65 + index)}.
                  </Label>
                  
                  <div className="flex-1">
                    <MathInput 
                        value={choice} 
                        onChange={(val) => handleChoiceChange(index, val)}
                        className="w-full border rounded p-2 bg-white"
                        placeholder={`Option ${index + 1}`}
                    />
                  </div>
                  
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveChoice(index)} disabled={choices.length <= 2}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Correct Answer for Text Input */}
          {taskType === 'TEXT_ANSWER' && (
            <div className="space-y-2">
                <Label htmlFor="correct-answer-text" className="text-base font-semibold">Correct Answer</Label>
                <Input 
                id="correct-answer-text"
                placeholder="e.g. x=5"
                value={textAnswerValue}
                onChange={(e) => setTextAnswerValue(e.target.value)}
                />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Create Task</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

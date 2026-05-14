import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import MathLiveEditor from '../components/MathLiveEditor';
import { Heart, Flame, CheckCircle, Target, User } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import 'mathlive';

/**
 * @typedef {Object} Problem
 * @property {number} task_id
 * @property {string} task_type
 * @property {string} task_text
 * @property {string} choices
 * @property {number} topic_id
 */

/**
 * @typedef {Object} UserProgress
 * @property {number} lives
 * @property {number} current_streak
 * @property {number} total_problems_solved
 * @property {number} correct_answers
 */

/**
 * @typedef {Object} Topic
 * @property {number} topic_id
 * @property {string} name
 */

const StudentDashboard = () => {
  /** @type {[Problem[], React.Dispatch<React.SetStateAction<Problem[]>>]} */
  const [problems, setProblems] = useState([]);
  /** @type {[UserProgress | null, React.Dispatch<React.SetStateAction<UserProgress | null>>]} */
  const [progress, setProgress] = useState(null);
  /** @type {[Topic[], React.Dispatch<React.SetStateAction<Topic[]>>]} */
  const [topics, setTopics] = useState([]);
  
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  const mathFieldRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchTopics(), fetchProgress(), fetchUserInfo()]).catch(console.error);
  }, []);
  
  useEffect(() => {
      if (mathFieldRef.current && problems.length > 0 && problems[currentProblemIndex]) {
          mathFieldRef.current.value = problems[currentProblemIndex].task_text || '';
      }
      setUserAnswer(''); // reset answer when problem changes
      setFeedback(null);
  }, [currentProblemIndex, problems]);

  const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if(!userId) return;

        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setUsername(data.username || '');
            setNewUsername(data.username || '');
        }
      } catch(error) {
          console.error("Error fetching user info:", error);
      }
  }

  const handleUpdateUsername = async () => {
      setUpdateStatus('Updating...');
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if(!userId) return;

        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: newUsername })
        });
        
        if (response.ok) {
            setUsername(newUsername);
            setUpdateStatus('Username updated successfully!');
            setTimeout(() => setUpdateStatus(''), 3000);
        } else {
             setUpdateStatus('Failed to update username.');
        }
      } catch(error) {
          console.error("Error updating user info:", error);
          setUpdateStatus('Error connecting to server.');
      }
  }


  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if(!userId) return;

        const response = await fetch(`http://localhost:5000/api/users/${userId}/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setProgress(data);
        }
      } catch(error) {
          console.error("Error fetching progress:", error);
      }
  }

  const fetchProblems = async (topicId) => {
    if (!topicId || topicId === 'none') {
        setProblems([]);
        return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/problems?topicId=${topicId}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
        setCurrentProblemIndex(0);
        setFeedback(null);
        setUserAnswer('');
      } else {
        console.error("Failed to fetch problems");
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (topicId) => {
    setSelectedTopic(topicId);
    fetchProblems(topicId).catch(console.error);
  };

  const handleSubmitAnswer = async () => {
      try {
        const token = localStorage.getItem('token');
        const currentProblem = problems[currentProblemIndex];
        
        // For choices, we might need to stringify array if multiple choice
        let finalAnswer = userAnswer;
        if (currentProblem.task_type === 'MULTIPLE_CHOICE') {
             // Let's ensure it's sorted so JSON string matches server side
             try {
                let parsed = JSON.parse(userAnswer);
                if (Array.isArray(parsed)) {
                    finalAnswer = JSON.stringify(parsed.sort());
                }
             } catch(e) {}
        }

        const response = await fetch('http://localhost:5000/api/problems/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                taskId: currentProblem?.task_id,
                answer: finalAnswer
            })
        });

        if (response.ok) {
            const data = await response.json();
            setFeedback(data.correct ? 'Correct! 🎉' : 'Incorrect. Try again.');
            fetchProgress().catch(console.error);
        } else {
            setFeedback('Error submitting answer.');
        }
      } catch (error) {
          console.error("Error submitting:", error);
          setFeedback('Error connecting to server.');
      }
  };

  const handleNextProblem = () => {
      if (currentProblemIndex < problems.length - 1) {
          setCurrentProblemIndex(prev => prev + 1);
          setUserAnswer('');
          setFeedback(null);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const handleCheckboxChange = (index) => {
     let currentSelection = [];
     try {
         currentSelection = JSON.parse(userAnswer || '[]');
     } catch (e) {}

     if (!Array.isArray(currentSelection)) currentSelection = [];

     if (currentSelection.includes(index)) {
         currentSelection = currentSelection.filter(i => i !== index);
     } else {
         currentSelection.push(index);
     }
     setUserAnswer(JSON.stringify(currentSelection));
  };


  const currentProblem = problems[currentProblemIndex];
  let parsedChoices = [];
  if (currentProblem && currentProblem.choices) {
      try {
          parsedChoices = JSON.parse(currentProblem.choices);
      } catch(e) {
          console.error("Failed to parse choices", e);
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4 px-6 border border-gray-100">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                     <User className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">
                    Welcome, {username || 'Student'}!
                </h1>
            </div>
            
            {progress && (
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-red-500 font-semibold" title="Lives">
                        <Heart className="w-5 h-5 fill-current" />
                        <span>{progress.lives}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-500 font-semibold" title="Streak">
                        <Flame className="w-5 h-5 fill-current" />
                        <span>{progress.current_streak}</span>
                    </div>
                </div>
            )}
            
            <Button variant="outline" onClick={handleLogout} size="sm">Logout</Button>
        </div>

        <Tabs defaultValue="practice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="stats">My Stats</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="practice">
                <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Practice Problems</h2>
                    <Select onValueChange={handleTopicChange}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a Topic" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Select a Topic</SelectItem>
                        {topics.map(topic => (
                        <SelectItem key={topic.topic_id} value={topic.topic_id.toString()}>
                            {topic.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : !selectedTopic || selectedTopic === 'none' ? (
                    <div className="text-center py-10 text-gray-500">
                        Please select a topic to view problems.
                    </div>
                ) : problems.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No problems available for this topic.
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                            <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">
                                Problem {currentProblemIndex + 1} of {problems.length}
                            </h2>
                            <div className="text-lg text-gray-800 mt-4 pointer-events-none">
                                <math-field ref={mathFieldRef} read-only style={{ display: 'block', fontSize: '1.25rem', backgroundColor: 'transparent', border: 'none', outline: 'none' }}>
                                </math-field>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Your Answer:</label>
                            
                            {(!currentProblem.task_type || currentProblem.task_type === 'TEXT_ANSWER') && (
                                <MathLiveEditor 
                                    initialValue={userAnswer} 
                                    onChange={setUserAnswer} 
                                />
                            )}

                            {currentProblem.task_type === 'SINGLE_CHOICE' && (
                                <RadioGroup 
                                    value={userAnswer} 
                                    onValueChange={(val) => setUserAnswer(val)}
                                    className="space-y-2 mt-4"
                                >
                                    {parsedChoices.map((choice, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <RadioGroupItem value={`[${index}]`} id={`r-${index}`} />
                                            <Label htmlFor={`r-${index}`} className="flex-1 cursor-pointer w-full">
                                                <MathLiveEditor initialValue={choice} readOnly={true} />
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentProblem.task_type === 'MULTIPLE_CHOICE' && (
                                <div className="space-y-2 mt-4">
                                    {parsedChoices.map((choice, index) => {
                                        let isChecked = false;
                                        try {
                                            const currentSel = JSON.parse(userAnswer || '[]');
                                            isChecked = currentSel.includes(index);
                                        } catch (e) {}

                                        return (
                                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Checkbox 
                                                    id={`c-${index}`} 
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleCheckboxChange(index)}
                                                />
                                                <Label htmlFor={`c-${index}`} className="flex-1 cursor-pointer w-full">
                                                    <MathLiveEditor initialValue={choice} readOnly={true} />
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                        </div>

                        <div className="flex items-center space-x-4 pt-2">
                            <Button onClick={handleSubmitAnswer} className="bg-blue-600 hover:bg-blue-700">
                                Submit Answer
                            </Button>
                            {feedback && (
                                <span className={`font-medium ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback}
                                </span>
                            )}
                        </div>

                        {feedback && feedback.includes('Correct') && currentProblemIndex < problems.length - 1 && (
                            <div className="mt-4 pt-4 border-t">
                                <Button variant="secondary" onClick={handleNextProblem}>
                                    Next Problem ➔
                                </Button>
                            </div>
                        )}

                        {feedback && currentProblemIndex === problems.length - 1 && (
                            <div className="mt-4 pt-4 border-t flex space-x-4">
                                <Button variant="default" onClick={() => fetchProblems(selectedTopic)}>
                                    Complete / Move to Next Level
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </TabsContent>

            <TabsContent value="stats">
                <Card>
                    <CardHeader>
                        <CardTitle>My Performance</CardTitle>
                        <CardDescription>Track your learning progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {progress ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                                    <Heart className="w-8 h-8 text-red-500 mb-2 fill-current" />
                                    <div className="text-2xl font-bold text-gray-800 mb-1">{progress.lives}</div>
                                    <div className="text-xs text-gray-600 uppercase font-semibold">Lives</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                                    <Flame className="w-8 h-8 text-orange-500 mb-2 fill-current" />
                                    <div className="text-2xl font-bold text-gray-800 mb-1">{progress.current_streak}</div>
                                    <div className="text-xs text-gray-600 uppercase font-semibold">Streak</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                                    <Target className="w-8 h-8 text-blue-500 mb-2" />
                                    <div className="text-2xl font-bold text-gray-800 mb-1">{progress.total_problems_solved}</div>
                                    <div className="text-xs text-gray-600 uppercase font-semibold">Total Solved</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                    <div className="text-2xl font-bold text-gray-800 mb-1">{progress.correct_answers}</div>
                                    <div className="text-xs text-gray-600 uppercase font-semibold">Correct</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Loading stats...</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your profile and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username"
                                    type="text" 
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter your username" 
                                />
                            </div>
                            {updateStatus && (
                                <p className={`text-sm ${updateStatus.includes('success') ? 'text-green-600' : 'text-gray-600'}`}>
                                    {updateStatus}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleUpdateUsername}>Save Changes</Button>
                    </CardFooter>
                </Card>
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
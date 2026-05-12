import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import MathLiveEditor from '../components/MathLiveEditor';
import { Heart, Flame, CheckCircle, Target } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import 'mathlive';

/**
 * @typedef {Object} Problem
 * @property {number} task_id
 * @property {string} task_text
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
  
  const mathFieldRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchTopics(), fetchProgress()]).catch(console.error);
  }, []);
  
  useEffect(() => {
      if (mathFieldRef.current && problems.length > 0) {
          mathFieldRef.current.value = problems[currentProblemIndex]?.task_text || '';
      }
  }, [currentProblemIndex, problems]);

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
        
        const response = await fetch('http://localhost:5000/api/problems/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                taskId: currentProblem?.task_id,
                answer: userAnswer
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

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4 px-6 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
            
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
                            <MathLiveEditor 
                                initialValue={userAnswer} 
                                onChange={setUserAnswer} 
                            />
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
                        <p className="text-gray-500 mb-4">Settings functionality coming soon.</p>
                        <div className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <input disabled type="text" className="w-full px-3 py-2 border rounded-md bg-gray-50" placeholder="Student User" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import MathLiveEditor from '../components/MathLiveEditor';
import { Heart, Flame } from 'lucide-react'; // Make sure to add lucide-react

/**
 * @typedef {Object} Problem
 * @property {number} task_id
 * @property {string} task_text
 */

/**
 * @typedef {Object} UserProgress
 * @property {number} lives
 * @property {number} current_streak
 */

const StudentDashboard = () => {
  /** @type {[Problem[], React.Dispatch<React.SetStateAction<Problem[]>>]} */
  const [problems, setProblems] = useState([]);
  /** @type {[UserProgress | null, React.Dispatch<React.SetStateAction<UserProgress | null>>]} */
  const [progress, setProgress] = useState(null);
  
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both problems and user progress when the component mounts
    Promise.all([fetchProblems(), fetchProgress()]).catch(console.error);
  }, []);

  const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // Assuming we start storing this on login
        if(!userId) return;

        const response = await fetch(`http://localhost:5000/api/users/${userId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            setProgress(data);
        }
      } catch(error) {
          console.error("Error fetching progress:", error);
      }
  }

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/problems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
      } else {
        console.error("Failed to fetch problems");
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
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
            
            // Refresh progress after every submission to update lives/streak
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
    window.location.href = '/login';
  };

  if (loading) return <div className="p-6 text-center">Loading problems...</div>;

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4 px-6 border border-gray-100">
            <h1 className="text-xl font-bold text-gray-800">Student Workspace</h1>
            
            {/* Progress Stats Row */}
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

        {/* Main Problem Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
            {problems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No problems available at the moment. Check back later!
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">
                            Problem {currentProblemIndex + 1} of {problems.length}
                        </h2>
                        <p className="text-lg text-gray-800">{currentProblem?.task_text}</p>
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
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
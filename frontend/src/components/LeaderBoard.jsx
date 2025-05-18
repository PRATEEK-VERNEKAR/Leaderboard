import { useState, useEffect } from "react";
import { FaTrophy, FaMedal, FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Confetti from "react-confetti";
import '../App.css'
import '../index.css'

export default function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/user/get-all-teams');
      if (!response.ok) throw new Error('Failed to fetch leaderboard data');
      
      const data = await response.json();
      let teamsArray = Array.isArray(data.teams) ? data.teams : [];

      const sortedTeams = teamsArray
        .sort((a, b) => b.points - a.points)
        .map((team, index) => ({
          ...team,
          position: index + 1,
          positionChange: team.previousPosition
            ? team.previousPosition - (index + 1)
            : 0
        }));

      setTeams(sortedTeams);
      setLastUpdated(new Date());

      if (sortedTeams.length > 0 && sortedTeams[0].points > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData(); // Only once on mount
  }, []);

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-300 to-yellow-500";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3: return "bg-gradient-to-r from-amber-600 to-amber-800";
      default: return "bg-white";
    }
  };

  const renderPositionIcon = (position) => {
    switch (position) {
      case 1: return <FaTrophy className="text-yellow-500 text-xl md:text-2xl" />;
      case 2: return <FaMedal className="text-gray-400 text-xl md:text-2xl" />;
      case 3: return <FaMedal className="text-amber-700 text-xl md:text-2xl" />;
      default: return <span className="font-bold text-lg md:text-xl">{position}</span>;
    }
  };

  const renderPositionChange = (change) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <FaArrowUp className="mr-1" />
          <span className="text-xs">{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <FaArrowDown className="mr-1" />
          <span className="text-xs">{Math.abs(change)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 py-6 px-2 sm:px-4 md:px-6 lg:px-12 flex flex-col">
      {showConfetti && 
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      }

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300 mb-2">
          Treasure Hunt Leaderboard
        </h1>
        <p className="text-blue-200 text-sm md:text-base">
          See who's leading the challenge!
        </p>
      </div>

      {/* Refresh and Status */}
      <div className="flex justify-between items-center mb-6 text-blue-200 text-sm md:text-base px-2 md:px-4">
        <span>
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "Loading latest data..."}
        </span>
        <button 
          onClick={fetchLeaderboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
        >
          Refresh Now
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className="flex-grow w-full max-w-6xl mx-auto">     
        {loading && teams.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-white font-bold animate-pulse">
              Loading leaderboard...
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong> {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <div 
                key={team._id} 
                className={`
                  ${getPositionColor(team.position)} 
                  rounded-lg shadow-lg overflow-hidden
                  transform transition-all duration-300
                  hover:shadow-xl hover:scale-[1.01]
                  ${team.position <= 3 ? 'border-2 border-yellow-400' : ''}
                `}
              >
                <div className="flex items-center p-4">
                  {/* Icon + Position Change */}
                  <div className="flex flex-col items-center mr-4 w-12">
                    {renderPositionIcon(team.position)}
                    {renderPositionChange(team.positionChange)}
                  </div>

                  {/* Team Name */}
                  <div className="flex-grow">
                    <h3 className={`font-bold ${team.position <= 3 ? 'text-lg md:text-xl' : 'text-base md:text-lg'}`}>
                      {team.team_name}
                    </h3>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className={`font-bold ${team.position <= 3 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
                      {team.points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>

                {/* Bottom Border Accent */}
                {[1, 2, 3].includes(team.position) && (
                  <div className={`h-1 ${team.position === 1
                    ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
                    : team.position === 2
                    ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'
                    : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600'}`}>
                  </div>
                )}
              </div>
            ))}

            {teams.length === 0 && !loading && (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-600">No teams found. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Icons */}
      <div className="fixed top-10 left-10 text-yellow-400 opacity-10 text-7xl hidden md:block">
        <FaStar />
      </div>
      <div className="fixed bottom-10 right-10 text-yellow-400 opacity-10 text-7xl hidden md:block">
        <FaTrophy />
      </div>
    </div>
  );
}

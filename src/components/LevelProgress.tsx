import { useStore } from '../store';

const LevelProgress = () => {
  const { level } = useStore();
  const maxPoints = level * 100;
  const currentPoints = level * 50; // Example: halfway to next level
  const progress = (currentPoints / maxPoints) * 100;

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">
          Level: <span className="text-[#ffd700] font-bold">{level}</span>
        </span>
        <span className="text-sm">
          {currentPoints}/{maxPoints}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-[#ffd700] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default LevelProgress; 
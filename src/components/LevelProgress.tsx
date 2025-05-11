import { useStore } from '../store';

const LevelProgress = () => {
  const { userLevel } = useStore();
  const progress = (userLevel.points / userLevel.maxPoints) * 100;

  return (
    <div className="my-4 w-full">
      <div className="flex items-center justify-between mb-1">
        <span>
          Level: <span className="text-[#ffd700] font-bold">{userLevel.current}</span>
        </span>
        <span>
          {userLevel.points}/{userLevel.maxPoints}
        </span>
      </div>
      <div className="h-5 bg-[#1f1f1f] rounded-lg overflow-hidden">
        <div 
          className="h-full bg-[#ffd700] transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default LevelProgress; 
import { motion } from 'framer-motion';
import { useStore } from '../store';

const Earn = () => {
  const { updateCoinBalance } = useStore();

  const tasks = [
    {
      icon: 'telegram',
      title: 'Join Telegram Channel',
      description: 'Follow our official channel for updates',
      reward: 50
    },
    {
      icon: 'instagram',
      title: 'Follow on Instagram',
      description: 'Follow our official Instagram page',
      reward: 50
    },
    {
      icon: 'twitter',
      title: 'Follow on Twitter',
      description: 'Follow and retweet our pinned post',
      reward: 50
    },
    {
      icon: 'youtube',
      title: 'Subscribe on YouTube',
      description: 'Subscribe to our YouTube channel',
      reward: 50
    },
    {
      icon: 'share-alt',
      title: 'Share with Friends',
      description: 'Share the app with 3 friends',
      reward: 50
    }
  ];

  const handleTaskComplete = (task: typeof tasks[0]) => {
    updateCoinBalance(task.reward);
  };

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-[#ffd700] mb-6 text-center">Complete Tasks to Earn</h2>
      
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.title}
            className="card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center mb-3">
              <i className={`fab fa-${task.icon} text-2xl mr-3 text-[#ffd700]`}></i>
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>
            </div>
            <motion.button
              className="task-btn w-full"
              onClick={() => handleTaskComplete(task)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Complete for {task.reward} coins
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      {/* Ad Space */}
      <div className="mt-6 p-3 bg-gray-800 rounded-lg text-center">
        <p className="text-sm text-gray-400">Advertisement Space</p>
        <div className="w-full h-20 bg-gray-700 rounded flex items-center justify-center">
          <p className="text-sm">Google Ads Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Earn; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'On Hold': 'bg-yellow-100 text-yellow-700',
    'default': 'bg-gray-100 text-gray-700'
  };

  const statusClass = statusColors[project.status] || statusColors.default;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => navigate(`/projects/${project._id}`)}
      className="bg-white shadow-md hover:shadow-xl transition-shadow rounded-2xl p-6 cursor-pointer border border-gray-200"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{project.name}</h3>
      <p className="text-sm text-gray-500 mb-2">
        <span className="font-medium text-gray-700">Manager:</span>{' '}
        {project.projectLeader?.name || 'Not assigned'}
      </p>
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <span className={`text-xs px-3 py-1 rounded-full ml-2 font-semibold ${statusClass}`}>
          {project.status}
        </span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

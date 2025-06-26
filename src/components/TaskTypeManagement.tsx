/**
 * Task Type Management component with milestone support
 */

import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedHours: number;
  isRequired: boolean;
}

interface TaskTypeWithMilestones {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  milestones: Milestone[];
  color: string;
  isActive: boolean;
}

/**
 * Task Type Management component
 */
const TaskTypeManagement: React.FC = () => {
  const { taskTypes, addTaskType, updateTaskType, deleteTaskType } = useData();
  const [editingTaskType, setEditingTaskType] = useState<TaskTypeWithMilestones | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);

  /**
   * Initialize form data
   */
  const initializeForm = (): TaskTypeWithMilestones => ({
    id: '',
    name: '',
    description: '',
    estimatedHours: 0,
    milestones: [],
    color: '#3B82F6',
    isActive: true
  });

  const [formData, setFormData] = useState<TaskTypeWithMilestones>(initializeForm());

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof TaskTypeWithMilestones, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle milestone form
   */
  const handleMilestoneChange = (field: keyof Milestone, value: any) => {
    setEditingMilestone(prev => prev ? { ...prev, [field]: value } : null);
  };

  /**
   * Add or update milestone
   */
  const saveMilestone = () => {
    if (!editingMilestone) return;

    const milestones = [...formData.milestones];
    const existingIndex = milestones.findIndex(m => m.id === editingMilestone.id);

    if (existingIndex >= 0) {
      milestones[existingIndex] = editingMilestone;
    } else {
      const newMilestone = {
        ...editingMilestone,
        id: Date.now().toString(),
        order: milestones.length + 1
      };
      milestones.push(newMilestone);
    }

    setFormData(prev => ({ ...prev, milestones }));
    setEditingMilestone(null);
    setShowMilestoneDialog(false);
  };

  /**
   * Delete milestone
   */
  const deleteMilestone = (milestoneId: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      const milestones = formData.milestones.filter(m => m.id !== milestoneId);
      setFormData(prev => ({ ...prev, milestones }));
    }
  };

  /**
   * Start creating new task type
   */
  const startCreating = () => {
    setFormData(initializeForm());
    setIsCreating(true);
    setEditingTaskType(null);
  };

  /**
   * Start editing task type
   */
  const startEditing = (taskType: any) => {
    const taskTypeWithMilestones: TaskTypeWithMilestones = {
      ...taskType,
      milestones: taskType.milestones || []
    };
    setFormData(taskTypeWithMilestones);
    setEditingTaskType(taskTypeWithMilestones);
    setIsCreating(false);
  };

  /**
   * Save task type
   */
  const saveTaskType = () => {
    if (!formData.name.trim()) {
      alert('Please enter a task type name');
      return;
    }

    const taskTypeData = {
      name: formData.name,
      description: formData.description,
      estimatedHours: formData.estimatedHours,
      milestones: formData.milestones,
      color: formData.color,
      isActive: formData.isActive
    };

    if (editingTaskType) {
      updateTaskType(editingTaskType.id, taskTypeData);
    } else {
      addTaskType(taskTypeData);
    }

    setFormData(initializeForm());
    setEditingTaskType(null);
    setIsCreating(false);
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setFormData(initializeForm());
    setEditingTaskType(null);
    setIsCreating(false);
    setShowMilestoneDialog(false);
    setEditingMilestone(null);
  };

  /**
   * Delete task type
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task type?')) {
      deleteTaskType(id);
    }
  };

  /**
   * Add new milestone
   */
  const addNewMilestone = () => {
    setEditingMilestone({
      id: '',
      name: '',
      description: '',
      order: formData.milestones.length + 1,
      estimatedHours: 0,
      isRequired: false
    });
    setShowMilestoneDialog(true);
  };

  /**
   * Edit existing milestone
   */
  const editMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Type Management</h2>
          <p className="text-gray-600">Manage task types and their milestones</p>
        </div>
        <Button onClick={startCreating} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task Type
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTaskType) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTaskType ? 'Edit Task Type' : 'Create New Task Type'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Task Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter task type name"
                />
              </div>
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task type description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Milestones</h3>
                <Button onClick={addNewMilestone} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              {formData.milestones.length > 0 ? (
                <div className="space-y-2">
                  {formData.milestones
                    .sort((a, b) => a.order - b.order)
                    .map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{milestone.name}</span>
                            {milestone.isRequired && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {milestone.estimatedHours}h
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => editMilestone(milestone)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteMilestone(milestone.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No milestones added yet</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={saveTaskType}>
                {editingTaskType ? 'Update Task Type' : 'Create Task Type'}
              </Button>
              <Button onClick={cancelEditing} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Dialog */}
      {showMilestoneDialog && editingMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingMilestone.id ? 'Edit Milestone' : 'Add Milestone'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="milestoneName">Milestone Name</Label>
                <Input
                  id="milestoneName"
                  value={editingMilestone.name}
                  onChange={(e) => handleMilestoneChange('name', e.target.value)}
                  placeholder="Enter milestone name"
                />
              </div>

              <div>
                <Label htmlFor="milestoneDescription">Description</Label>
                <Textarea
                  id="milestoneDescription"
                  value={editingMilestone.description}
                  onChange={(e) => handleMilestoneChange('description', e.target.value)}
                  placeholder="Enter milestone description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="milestoneHours">Estimated Hours</Label>
                <Input
                  id="milestoneHours"
                  type="number"
                  value={editingMilestone.estimatedHours}
                  onChange={(e) => handleMilestoneChange('estimatedHours', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="milestoneRequired"
                  checked={editingMilestone.isRequired}
                  onChange={(e) => handleMilestoneChange('isRequired', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="milestoneRequired">Required milestone</Label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={saveMilestone}>
                {editingMilestone.id ? 'Update' : 'Add'} Milestone
              </Button>
              <Button onClick={() => setShowMilestoneDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Types List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taskTypes.map((taskType) => (
          <Card key={taskType.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: taskType.color || '#3B82F6' }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{taskType.name}</h3>
                    <p className="text-sm text-gray-600">{taskType.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => startEditing(taskType)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(taskType.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{taskType.estimatedHours || 0} hours estimated</span>
                </div>
                
                {taskType.milestones && taskType.milestones.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>{taskType.milestones.length} milestones</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {taskType.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="text-xs text-gray-500">
                          • {milestone.name}
                        </div>
                      ))}
                      {taskType.milestones.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{taskType.milestones.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${taskType.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-600">
                    {taskType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {taskTypes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No task types found</h3>
          <p className="text-gray-600 mb-4">Create your first task type to get started</p>
          <Button onClick={startCreating}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task Type
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskTypeManagement;

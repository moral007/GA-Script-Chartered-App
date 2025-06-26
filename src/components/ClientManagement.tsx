/**
 * Client management component for admin operations
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, Edit, Building2, Mail, Phone, MapPin, Users } from 'lucide-react';
import { Client } from '../types';

/**
 * Client management component with full CRUD functionality
 */
const ClientManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const { clients, addClient, updateClient, tasks } = useData();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    isActive: true
  });

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      isActive: true
    });
  };

  /**
   * Handle form submission for creating new client
   */
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    addClient(formData);
    resetForm();
    setIsCreateDialogOpen(false);
  };

  /**
   * Handle client editing
   */
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      contactPerson: client.contactPerson || '',
      isActive: client.isActive
    });
    setIsEditDialogOpen(true);
  };

  /**
   * Handle client update
   */
  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    updateClient(selectedClient.id, formData);
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  /**
   * Get task count for client
   */
  const getClientTaskCount = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId).length;
  };

  /**
   * Toggle client active status
   */
  const toggleClientStatus = (clientId: string, isActive: boolean) => {
    updateClient(clientId, { isActive });
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeClients = clients.filter(c => c.isActive);
  const inactiveClients = clients.filter(c => !c.isActive);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage client information and relationships</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-green-900">{activeClients.length}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-900">
                  {tasks.filter(t => activeClients.some(c => c.id === t.clientId)).length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Active Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {activeClients.map((client) => (
              <div key={client.id} className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        {client.contactPerson && (
                          <p className="text-sm text-gray-600">Contact: {client.contactPerson}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{client.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{client.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {getClientTaskCount(client.id)} tasks
                        </span>
                      </div>
                    </div>
                    
                    {client.address && (
                      <div className="flex items-start space-x-2 mt-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{client.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ACTIVE
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClient(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => toggleClientStatus(client.id, false)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {activeClients.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active clients</h3>
                <p className="text-gray-500">Add your first client to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Clients */}
      {inactiveClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500">{client.name}</h4>
                      <p className="text-sm text-gray-400">{client.email}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => toggleClientStatus(client.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;

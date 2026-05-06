import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TaskCreatorTab from './TaskCreatorTab';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="global-stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global-stats">Global Stats</TabsTrigger>
          <TabsTrigger value="task-stats">Task Stats</TabsTrigger>
          <TabsTrigger value="content-creation">Content Creation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global-stats">
          <Card>
            <CardHeader>
              <CardTitle>Global User Statistics</CardTitle>
              <CardDescription>Overview of user performance and engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Placeholder for Global Stats (Graphs, Charts, Tables)</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="task-stats">
          <Card>
            <CardHeader>
              <CardTitle>Task Specific Statistics</CardTitle>
              <CardDescription>Detailed analysis per task or topic.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Placeholder for Task Stats</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content-creation">
          <TaskCreatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

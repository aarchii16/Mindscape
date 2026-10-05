import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Heart,
  Activity,
  Clock,
  BookOpen,
  Shield,
  Download,
  Eye,
  Filter
} from "lucide-react";

const analyticsData = {
  totalUsers: 2456,
  activeUsers: 1834,
  chatSessions: 5672,
  bookings: 342,
  forumPosts: 789,
  resourceViews: 12456,
  emergencyContacts: 23,
  satisfaction: 4.7
};

const recentActivity = [
  {
    id: '1',
    type: 'chat',
    description: 'Anonymous user started anxiety support chat',
    time: '2 minutes ago',
    urgent: false,
    category: 'AI Support'
  },
  {
    id: '2',
    type: 'booking',
    description: 'New counseling session booked for tomorrow',
    time: '15 minutes ago',
    urgent: false,
    category: 'Booking'
  },
  {
    id: '3',
    type: 'alert',
    description: 'Crisis keywords detected in chat session',
    time: '1 hour ago',
    urgent: true,
    category: 'Emergency'
  },
  {
    id: '4',
    type: 'forum',
    description: 'New post in Depression support category',
    time: '2 hours ago',
    urgent: false,
    category: 'Community'
  },
  {
    id: '5',
    type: 'resource',
    description: 'High engagement on anxiety guide resource',
    time: '3 hours ago',
    urgent: false,
    category: 'Resources'
  }
];

const topResources = [
  {
    title: 'Understanding Anxiety: A Student Guide',
    views: 1245,
    downloads: 892,
    rating: 4.8
  },
  {
    title: 'Mindful Breathing for Panic Attacks',
    views: 987,
    downloads: 654,
    rating: 4.9
  },
  {
    title: 'Sleep Hygiene for Better Mental Health',
    views: 743,
    downloads: 445,
    rating: 4.6
  }
];

const chatTopics = [
  { topic: 'Anxiety Management', count: 1456, percentage: 34 },
  { topic: 'Academic Stress', count: 892, percentage: 21 },
  { topic: 'Depression Support', count: 673, percentage: 16 },
  { topic: 'Sleep Issues', count: 445, percentage: 10 },
  { topic: 'Relationship Problems', count: 234, percentage: 6 },
  { topic: 'Other', count: 567, percentage: 13 }
];

export default function DashboardPage() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'booking': return <Calendar className="w-4 h-4 text-secondary-dark" />;
      case 'forum': return <Users className="w-4 h-4 text-accent" />;
      case 'resource': return <BookOpen className="w-4 h-4 text-primary-light" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor platform usage, student wellbeing trends, and resource effectiveness
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="glass">
              <Filter className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" className="glass">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-primary">{analyticsData.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Chat Sessions</p>
                  <p className="text-3xl font-bold text-secondary-dark">{analyticsData.chatSessions.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-secondary-dark/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Counselor Bookings</p>
                  <p className="text-3xl font-bold text-accent">{analyticsData.bookings}</p>
                  <p className="text-xs text-destructive flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -3% from last month
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                  <p className="text-3xl font-bold text-primary-light">{analyticsData.satisfaction}/5.0</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.2 from last month
                  </p>
                </div>
                <Heart className="w-8 h-8 text-primary-light/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/20 transition-colors">
                      <div className="p-2 rounded-lg bg-muted/30">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs glass">
                            {activity.category}
                          </Badge>
                          {activity.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Topics Distribution */}
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Common Chat Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chatTopics.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Emergency Alerts */}
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Emergency Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive mb-2">
                    {analyticsData.emergencyContacts}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crisis interventions this month
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Review Cases
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Resources */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Top Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topResources.map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-sm leading-tight">
                        {resource.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {resource.views}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {resource.downloads}
                        </div>
                        <div className="flex items-center">
                          ⭐ {resource.rating}
                        </div>
                      </div>
                      {index < topResources.length - 1 && (
                        <div className="border-b border-border/30" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Status</span>
                  <Badge className="bg-success text-white">Healthy</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="outline" className="glass">
                    {analyticsData.activeUsers} online
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium text-success">Fast</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
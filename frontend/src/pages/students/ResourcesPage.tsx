import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Search, 
  Play, 
  Download, 
  Heart, 
  Brain,
  Bed,
  Users,
  Lightbulb,
  FileText,
  Headphones,
  Video,
  Star,
  Clock,
  Tag
} from "lucide-react";

const resourceCategories = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'anxiety', name: 'Anxiety & Panic', icon: Heart },
  { id: 'depression', name: 'Depression & Mood', icon: Brain },
  { id: 'stress', name: 'Stress & Academic', icon: Lightbulb },
  { id: 'sleep', name: 'Sleep & Rest', icon: Bed },
  { id: 'relationships', name: 'Relationships', icon: Users },
];

const resources = [
  {
    id: '1',
    title: 'Understanding Anxiety: A Student Guide',
    type: 'PDF',
    category: 'anxiety',
    duration: '15 min read',
    rating: 4.8,
    downloads: 2340,
    description: 'Comprehensive guide covering anxiety symptoms, triggers, and evidence-based coping strategies for students.',
    tags: ['Beginner Friendly', 'CBT Techniques', 'Self-Help'],
    icon: FileText,
    featured: true,
    url: 'https://medicine.umich.edu/sites/default/files/content/downloads/CBT-Basic-Group-for-Anxiety-Patient-Manual.pdf'
  },
  {
    id: '2',
    title: 'Mindful Breathing for Panic Attacks',
    type: 'Audio',
    category: 'anxiety',
    duration: '8 minutes',
    rating: 4.9,
    downloads: 1890,
    description: 'Guided audio session to help manage panic attacks using mindfulness and breathing techniques.',
    tags: ['Guided Practice', 'Emergency Tool', 'Mindfulness'],
    icon: Headphones,
    featured: false,
    url: 'https://example.com/resources/mindful-breathing.mp3'
  },
  {
    id: '3',
    title: 'Overcoming Academic Procrastination',
    type: 'Video',
    category: 'stress',
    duration: '22 minutes',
    rating: 4.7,
    downloads: 3120,
    description: 'Video workshop on understanding procrastination patterns and developing effective study habits.',
    tags: ['Academic Success', 'Time Management', 'Motivation'],
    icon: Video,
    featured: true,
    url: 'https://www.youtube.com/watch?v=uzAh-bQwGRs'
  },
  {
    id: '4',
    title: 'Sleep Hygiene for Better Mental Health',
    type: 'PDF',
    category: 'sleep',
    duration: '12 min read',
    rating: 4.6,
    downloads: 1560,
    description: 'Evidence-based tips for improving sleep quality and its impact on mental wellbeing.',
    tags: ['Sleep Science', 'Healthy Habits', 'Mental Health'],
    icon: FileText,
    featured: false,
    url: 'https://example.com/resources/sleep-hygiene.pdf'
  },
  {
    id: '5',
    title: 'Progressive Muscle Relaxation',
    type: 'Audio',
    category: 'stress',
    duration: '18 minutes',
    rating: 4.8,
    downloads: 2100,
    description: 'Step-by-step audio guide for progressive muscle relaxation to reduce stress and tension.',
    tags: ['Relaxation', 'Body Awareness', 'Stress Relief'],
    icon: Headphones,
    featured: false,
    url: 'https://example.com/resources/pmr.mp3'
  },
  {
    id: '6',
    title: 'Building Healthy Relationships in College',
    type: 'Video',
    category: 'relationships',
    duration: '28 minutes',
    rating: 4.5,
    downloads: 980,
    description: 'Workshop on developing and maintaining healthy relationships during your college years.',
    tags: ['Social Skills', 'Communication', 'Boundaries'],
    icon: Video,
    featured: false,
    url: 'https://example.com/resources/healthy-relationships.mp4'
  },
  {
    id: '7',
    title: 'Depression Self-Assessment Worksheet',
    type: 'PDF',
    category: 'depression',
    duration: '10 min activity',
    rating: 4.4,
    downloads: 1340,
    description: 'Interactive worksheet to help identify depression symptoms and track mood patterns.',
    tags: ['Self-Assessment', 'Mood Tracking', 'Awareness'],
    icon: FileText,
    featured: false,
    url: 'https://example.com/resources/depression-assessment.pdf'
  },
  {
    id: '8',
    title: 'Guided Meditation for Better Sleep',
    type: 'Audio',
    category: 'sleep',
    duration: '25 minutes',
    rating: 4.9,
    downloads: 2890,
    description: 'Calming guided meditation designed to help you fall asleep peacefully and improve sleep quality.',
    tags: ['Meditation', 'Sleep Aid', 'Relaxation'],
    icon: Headphones,
    featured: true,
    url: 'https://www.youtube.com/watch?v=YBlMI7m89Tg&vl=en'
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter(r => r.featured);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-primary/10 text-primary';
      case 'Audio': return 'bg-secondary/20 text-secondary-dark';
      case 'Video': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Wellness Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access our curated collection of mental health resources, guides, and tools designed specifically for students
          </p>
        </div>

        {/* Search and Filter */}
        <div className="glass-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources, topics, or techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass border-border/30"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {resourceCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="glass hover-glass"
              >
                <category.icon className="w-3 h-3 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-primary" />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map(resource => (
                <Card key={resource.id} className="glass-card hover-glass border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <resource.icon className="w-6 h-6 text-primary" />
                      <Badge className={`${getTypeColor(resource.type)} text-xs`}>
                        {resource.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs glass">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.duration}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {resource.rating}
                      </div>
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {resource.downloads}
                      </div>
                    </div>
                    
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      download={resource.type === 'PDF'}
                    >
                      <Button className="w-full rounded-xl hover-glass" size="sm">
                        {resource.type === 'Audio' && <Play className="w-3 h-3 mr-2" />}
                        {resource.type === 'Video' && <Play className="w-3 h-3 mr-2" />}
                        {resource.type === 'PDF' && <Download className="w-3 h-3 mr-2" />}
                        {resource.type === 'Audio' || resource.type === 'Video' ? 'Play' : 'Download'}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'All Resources' : resourceCategories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-muted-foreground">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="glass-card hover-glass">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <resource.icon className="w-5 h-5 text-primary" />
                    <Badge className={`${getTypeColor(resource.type)} text-xs`}>
                      {resource.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-tight">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs glass">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {resource.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {resource.rating}
                    </div>
                  </div>
                  
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    download={resource.type === 'PDF'}
                  >
                    <Button variant="outline" className="w-full rounded-xl glass hover-glass" size="sm">
                      {resource.type === 'Audio' && <Play className="w-3 h-3 mr-2" />}
                      {resource.type === 'Video' && <Play className="w-3 h-3 mr-2" />}
                      {resource.type === 'PDF' && <Download className="w-3 h-3 mr-2" />}
                      Access Resource
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12 glass-card">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
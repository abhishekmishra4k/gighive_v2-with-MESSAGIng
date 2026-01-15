import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';

export function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/gigs');
        const data = await res.json();
        setPosts(
          data.map(gig => ({
            type: 'employer',
            company: gig.company || "Unknown",
            time: new Date(gig.createdAt).toLocaleString(),
            content: gig.description,
            image: null,
            likes: gig.likes?.length || 0,
            comments: gig.comments?.length || 0
          }))
        );
      } catch (err) {
        console.error('Failed to load feed:', err);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="text-muted-foreground">Stay updated with the GigHive community</p>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                  <span className="font-semibold text-sm">
                    {post.company.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{post.company}</h4>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {post.type === 'employer' ? 'Employer' : 'Student'}
                </Badge>
              </div>

              <p className="mb-4">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart size={16} />
                    </Button>
                    <span className="text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <MessageCircle size={16} />
                    </Button>
                    <span className="text-sm">{post.comments}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Share size={16} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bookmark size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

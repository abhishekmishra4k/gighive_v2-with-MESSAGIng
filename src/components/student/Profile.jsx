import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Star, 
  Heart, 
  Bookmark,
  Edit,
  Users,
  Award,
  Calendar
} from 'lucide-react';

export function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/profile/me');
        setUser(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p className="text-center py-8">Loading profile...</p>;
  if (!user) return <p className="text-center py-8">User not found</p>;

  const profileStats = {
    rating: user.rating || 4.8,
    gigsCompleted: user.completedGigs || 0,
    friends: user.friends || 0,
    followers: user.followers || 0
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
              {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.verified && <Badge variant="secondary">Verified</Badge>}
              </div>
              <p className="text-muted-foreground mb-3">
                {user.major || 'Student'} • {user.university || 'College'}
              </p>

              <div className="flex items-center gap-6 mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{profileStats.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{profileStats.gigsCompleted} gigs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{profileStats.followers} followers</span>
                </div>
              </div>

              <Button variant="outline">
                <Edit size={16} className="mr-2" /> Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="gigs">Completed Gigs</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="p-4">
          <p>{user.bio || 'No bio available yet.'}</p>
        </TabsContent>

        <TabsContent value="skills" className="p-4">
          {user.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, i) => (
                <Badge key={i} variant="outline">{skill}</Badge>
              ))}
            </div>
          ) : (
            <p>No skills added yet.</p>
          )}
        </TabsContent>

        <TabsContent value="gigs" className="p-4">
          {user.completedProjects?.length ? (
            user.completedProjects.map((p, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-4">
                  <h4 className="font-semibold">{p.title}</h4>
                  <p className="text-sm text-muted-foreground">{p.company}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No completed gigs yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
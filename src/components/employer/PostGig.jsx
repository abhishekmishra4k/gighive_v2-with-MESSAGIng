import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

import { Upload, X, Plus, MapPin, IndianRupee, FileText } from 'lucide-react';

export function PostGig() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    pay: '',
    payType: 'fixed',
    duration: '',
    location: '',
    type: '',
    experience: '',
    teamSize: '1',
    urgent: false,
    collegeSpecific: false,
    colleges: [],
    videoUrl: ''
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [videoUploading, setVideoUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const videoInputRef = useRef(null);

  const categories = ['Web Development', 'Mobile App Development', 'Graphic Design'];
  const skillOptions = ['React', 'Node.js', 'MongoDB', 'UI/UX Design', 'Python',
  'Video Editing', 'Marketing', 'Content Writing', 'Data Analysis', 'Cloud Deployment'];
  const colleges = [/* ... */];

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type) || file.size > 50 * 1024 * 1024) {
      toast.error('Invalid file. Please upload MP4, MOV, or AVI under 50MB.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to upload a video.');
      return;
    }

    setVideoUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('gigReel', file);

      const res = await fetch('http://localhost:5001/api/gigs/upload-reel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await res.json();
      setFormData(prev => ({ ...prev, videoUrl: data.url }));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Try again.');
    } finally {
      setVideoUploading(false);
    }
  };

  const triggerVideoInput = () => {
    videoInputRef.current?.click();
  };
const token = localStorage.getItem('token');
try {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('📦 Decoded token payload:', decoded);
} catch (err) {
  console.error('❌ Failed to decode token:', err);
}

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const isValidJWT = token && typeof token === 'string' && token.split('.').length === 3;
    if (!isValidJWT) {
      toast.error('Invalid or missing token. Please log in again.');
      return;
    }

    const payload = {
      ...formData,
      skills: selectedSkills,
      pay: {
        type: formData.payType,
        amount: formData.payType === 'hourly' ? `${formData.pay}/hour` : formData.pay
      }
    };

    console.log('form=========data==========',payload)

    try {
      console.log('Sending token:', token);

      const res = await fetch('http://localhost:5001/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Gig posted successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          skills: [],
          pay: '',
          payType: 'fixed',
          duration: '',
          location: '',
          type: '',
          experience: '',
          teamSize: '1',
          urgent: false,
          collegeSpecific: false,
          colleges: [],
          videoUrl: ''
        });
        setSelectedSkills([]);
        fetchGigs();
      } else {
        console.error('Gig post failed:', data);
        toast.error(`Error: ${data.msg || 'Failed to post gig'}`);
      }
    } catch (err) {
      console.error('Error posting gig:', err);
      toast.error('Error posting gig.');
    }
  };

  const fetchGigs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Skipping fetch: no token found');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/gigs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch gigs:', err);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token);

      const isValidJWT = token && typeof token === 'string' && token.split('.').length === 3;
      if (isValidJWT) {
        fetchGigs();
      } else {
        console.warn('⛔ Token missing or invalid. Skipping fetch.');
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
    }
  }, []);


  return (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Post a New Gig</h1>
      <p className="text-muted-foreground">Create an opportunity for talented students</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gig Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., React Developer for E-commerce Platform"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project, requirements, and expectations..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Experience Level</label>
              <Select onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="any">Any Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
              {skillOptions.map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => handleSkillToggle(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

        {/* Budget & Timeline */}
       
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee size={20} /> {/* ✅ INR icon */}
          Pay & Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pay</label>
            <Select onValueChange={(value) => setFormData({ ...formData, payType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select pay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Pay ({formData.payType === 'hourly' ? 'per hour' : 'total'}) *
            </label>
            <Input
              type="number"
              value={formData.pay}
              onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
              placeholder={formData.payType === 'hourly' ? '₹250' : '₹5000'} // ✅ INR placeholders
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Duration</label>
            <Select onValueChange={(value) => setFormData({ ...formData, duration: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-week">1 Week</SelectItem>
                <SelectItem value="2-weeks">2 Weeks</SelectItem>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="2-months">2 Months</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team Size</label>
            <Select onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
              <SelectTrigger>
                <SelectValue placeholder="How many students?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Student</SelectItem>
                <SelectItem value="2-3">2-3 Students</SelectItem>
                <SelectItem value="4-5">4-5 Students</SelectItem>
                <SelectItem value="5+">5+ Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  


        {/* Location & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Location & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Work Type</label>
                <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State or 'Remote'"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({...formData, urgent: checked})}
                />
                <span className="text-sm">Mark as urgent (higher visibility)</span>
              </label>

              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.collegeSpecific}
                  onCheckedChange={(checked) => setFormData({...formData, collegeSpecific: checked})}
                />
                <span className="text-sm">Limit to specific colleges</span>
              </label>

              {formData.collegeSpecific && (
                <div className="ml-6">
                  <label className="block text-sm font-medium mb-2">Select Colleges</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colleges.map(college => (
                      <label key={college} className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">{college}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Upload */}
       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Gig Reel (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a short video (30–60 seconds) to showcase your project and attract more applicants
              </p>

              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept=".mp4,.mov,.avi"
                className="hidden"
              />
              <Button variant="outline" type="button" onClick={triggerVideoInput} disabled={videoUploading}>
                {videoUploading ? 'Uploading...' : 'Choose Video File'}
              </Button>

              {formData.videoUrl && (
                <p className="text-xs text-green-600 mt-2">Video uploaded successfully!</p>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Max file size: 50MB. Supported formats: MP4, MOV, AVI
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 mt-6">
          <Button type="submit" className="flex-1">
            <Plus className="mr-2" size={16} />
            Post Gig
          </Button>
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
export default PostGig;
import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Upload, GraduationCap, CheckCircle } from 'lucide-react';

import { toast } from 'react-toastify';

export function CollegeGigs({ user }) {
  const isVerified = user?.verified || false;
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Invalid file. Please upload JPG, PNG, or PDF under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      // Replace this with your actual backend endpoint
      // await fetch('/api/upload-college-id', {
      //   method: 'POST',
      //   body: formData,
      // });

      setTimeout(() => {
        setUploading(false);
        setUploadSuccess(true);
        toast.success('Document uploaded successfully! Awaiting verification.');
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">College Gigs</h1>
        <p className="text-muted-foreground">Exclusive opportunities for your university</p>
      </div>

      {!isVerified ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <GraduationCap className="mx-auto mb-4 text-primary" size={64} />
            <CardTitle>Verify Your College Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Upload your college ID to access exclusive gigs available only to students from your university.
            </p>

            <div className="border-2 border-dashed border-border rounded-lg p-8">
              <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a clear photo of your student ID or enrollment verification
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <Button onClick={triggerFileInput} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>

              {uploadSuccess && (
                <p className="text-sm text-green-600 mt-2">Upload successful! Awaiting verification.</p>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Benefits of Verification:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access to college-specific gigs</li>
                <li>• Higher priority in applications</li>
                <li>• Exclusive campus opportunities</li>
                <li>• Connect with alumni employers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold text-green-900">Verification Complete!</h3>
                  <p className="text-sm text-green-700">
                    You now have access to exclusive {user?.college || 'university'} gigs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {[
              {
                title: "Research Assistant - CS Department",
                department: "Computer Science",
                pay: "$15/hour",
                type: "Part-time",
                spots: "3 positions available"
              },
              {
                title: "Campus Tour Guide",
                department: "Admissions Office",
                pay: "$12/hour",
                type: "Flexible",
                spots: "5 positions available"
              },
              {
                title: "Teaching Assistant - Intro Programming",
                department: "Computer Science",
                pay: "$18/hour",
                type: "Academic Year",
                spots: "2 positions available"
              }
            ].map((gig, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{gig.title}</h3>
                      <p className="text-muted-foreground">{gig.department}</p>
                    </div>
                    <Badge variant="secondary">{user?.college || 'University'} Only</Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium">{gig.pay}</span>
                    <span className="text-sm text-muted-foreground">{gig.type}</span>
                    <span className="text-sm text-green-600">{gig.spots}</span>
                  </div>

                  <Button>Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

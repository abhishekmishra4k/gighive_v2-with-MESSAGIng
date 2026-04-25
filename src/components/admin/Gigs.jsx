// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Button } from '../ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { FileText, Check, X, Eye } from 'lucide-react';

// export function Gigs({ user }) {
//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold">Gig Management</h1>
//         <p className="text-muted-foreground">Review and manage gig postings</p>
//       </div>

//       <Tabs defaultValue="pending" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="pending">Pending Review (12)</TabsTrigger>
//           <TabsTrigger value="approved">Approved Gigs</TabsTrigger>
//           <TabsTrigger value="rejected">Rejected Gigs</TabsTrigger>
//         </TabsList>

//         <TabsContent value="pending">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText size={20} />
//                 Gigs Pending Review
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {[
//                   { title: "React Developer for E-commerce", company: "TechStart Inc.", budget: "$2,500", submitted: "30 minutes ago" },
//                   { title: "UI/UX Designer for Mobile App", company: "DesignFlow Studio", budget: "$1,800", submitted: "2 hours ago" }
//                 ].map((gig, index) => (
//                   <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
//                     <div>
//                       <h4 className="font-medium">{gig.title}</h4>
//                       <p className="text-sm text-muted-foreground">{gig.company}</p>
//                       <div className="flex items-center gap-2 mt-1">
//                         <Badge variant="secondary" className="text-xs">
//                           Budget: {gig.budget}
//                         </Badge>
//                         <Badge variant="secondary" className="text-xs">
//                           Submitted {gig.submitted}
//                         </Badge>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button size="sm" variant="outline">
//                         <Eye size={16} className="mr-2" />
//                         Review
//                       </Button>
//                       <Button size="sm" variant="outline">
//                         <Check size={16} className="mr-2" />
//                         Approve
//                       </Button>
//                       <Button size="sm" variant="outline">
//                         <X size={16} className="mr-2" />
//                         Reject
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="approved">
//           <p className="text-muted-foreground text-center py-8">
//             Approved gigs will appear here
//           </p>
//         </TabsContent>

//         <TabsContent value="rejected">
//           <p className="text-muted-foreground text-center py-8">
//             Rejected gigs will appear here
//           </p>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Check, X, Eye } from 'lucide-react';

export function Gigs({ user }) {
  const [pendingGigs, setPendingGigs] = useState([]);
  const [approvedGigs, setApprovedGigs] = useState([]);
  const [rejectedGigs, setRejectedGigs] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await apiClient.get('/gigs/all');
        const data = res.data;
        setPendingGigs(data.filter(g => !g.verified && !g.rejected));
        setApprovedGigs(data.filter(g => g.verified));
        setRejectedGigs(data.filter(g => g.rejected));
      } catch (err) {
        console.error('Failed to fetch gigs:', err);
      }
    };

    fetchGigs();
  }, []);

  const handleVerify = async (id) => {
    try {
      const res = await apiClient.put(`/gigs/${id}/verify`);
      const updated = res.data;
      setPendingGigs(prev => prev.filter(g => g._id !== id));
      setApprovedGigs(prev => [...prev, updated.gig]);
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await apiClient.put(`/gigs/${id}/reject`);
      const updated = res.data;
      setPendingGigs(prev => prev.filter(g => g._id !== id));
      setRejectedGigs(prev => [...prev, updated.gig]);
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  const renderGigCard = (gig, showActions = true) => (
    <div key={gig._id} className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h4 className="font-medium">{gig.title}</h4>
        <p className="text-sm text-muted-foreground">{gig.employer?.name || 'Unknown'}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            Budget: {gig.pay?.amount || 'N/A'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Submitted {new Date(gig.createdAt).toLocaleString()}
          </Badge>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Eye size={16} className="mr-2" />
            Review
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleVerify(gig._id)}>
            <Check size={16} className="mr-2" />
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleReject(gig._id)}>
            <X size={16} className="mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gig Management</h1>
        <p className="text-muted-foreground">Review and manage gig postings</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingGigs.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved Gigs ({approvedGigs.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Gigs ({rejectedGigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Gigs Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingGigs.length > 0 ? (
                  pendingGigs.map(gig => renderGigCard(gig))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No gigs pending review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedGigs.length > 0 ? (
                  approvedGigs.map(gig => renderGigCard(gig, false))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Approved gigs will appear here
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedGigs.length > 0 ? (
                  rejectedGigs.map(gig => renderGigCard(gig, false))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Rejected gigs will appear here
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

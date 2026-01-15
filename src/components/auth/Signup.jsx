// import React, { useState } from 'react';
// import axios from 'axios';

// // --- MOCK UI COMPONENTS ---
// // In a real app, these would be imported from a UI library like ShadCN.
// const Card = ({ children }) => <div className="bg-white shadow-md rounded-lg p-6">{children}</div>;
// const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
// const CardTitle = ({ children }) => <h2 className="text-2xl font-bold text-center">{children}</h2>;
// const CardContent = ({ children }) => <div>{children}</div>;
// const Input = (props) => <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />;
// const Button = ({ children, ...props }) => <button {...props} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors">{children}</button>;
// const Checkbox = (props) => <input type="checkbox" {...props} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />;
// const Header = () => <header className="p-4 bg-white shadow-sm"><div className="text-xl font-bold">GigHive</div></header>;
// const Footer = () => <footer className="p-4 bg-gray-100 text-center text-sm text-gray-600">© 2025 GigHive</footer>;

// export function Signup() {
//     // --- STATE MANAGEMENT ---
//     const [userType, setUserType] = useState('student');
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         agreeToTerms: false,
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setError('');
//         setSuccess('');
//         setFormData({
//             ...formData,
//             [name]: type === 'checkbox' ? checked : value,
//         });
//     };

//     // --- FORM SUBMISSION ---
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');

//         if (formData.password !== formData.confirmPassword) {
//             setError('Passwords do not match.');
//             return;
//         }

//         if (!formData.agreeToTerms) {
//             setError('You must agree to the terms of service.');
//             return;
//         }

//         setLoading(true);

//         try {
//             // THIS IS THE REAL API CALL
//             const API_URI = "http://localhost:5001/api/user/register";

//             const payload = {
//                 name: `${formData.firstName} ${formData.lastName}`,
//                 email: formData.email,
//                 password: formData.password,
//                 role: userType, // Pass the selected user type as 'role'
//             };

//             console.log("📤 Sending signup payload:", payload);
//             await axios.post(API_URI, payload);
//             console.log("📥 User registration successful!");

//             setSuccess("Registration successful! You can now log in.");
//             // In a real app, you might auto-login or navigate to a verification page.
//             // For now, we'll just show a success message.
//             // navigate('/login');

//         } catch (err) {
//             console.error("Axios signup error response:", err.response);
//             const errorMsg = err.response?.data?.msg || "An error occurred during sign up. Please try again.";
//             setError(errorMsg);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- RENDER ---
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Header />
//             <div className="flex items-center justify-center py-12 px-4">
//                 <div className="w-full max-w-md">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Create an Account</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</p>}
//                                 {success && <p className="bg-green-100 text-green-700 p-3 rounded-md text-center">{success}</p>}

//                                 {/* User Type Tabs */}
//                                 <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-100 p-1">
//                                     <button type="button" onClick={() => setUserType('student')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${userType === 'student' ? 'bg-white shadow' : ''}`}>Student</button>
//                                     <button type="button" onClick={() => setUserType('employer')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${userType === 'employer' ? 'bg-white shadow' : ''}`}>Employer</button>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">First Name</label>
//                                         <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">Last Name</label>
//                                         <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Email</label>
//                                     <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Password</label>
//                                     <Input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
//                                     <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
//                                 </div>

//                                 <div className="flex items-start">
//                                     <Checkbox id="terms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} />
//                                     <div className="ml-3 text-sm">
//                                         <label htmlFor="terms" className="text-gray-500">I agree to the Terms of Service</label>
//                                     </div>
//                                 </div>

//                                 <Button type="submit" disabled={loading}>
//                                     {loading ? 'Creating Account...' : 'Create Account'}
//                                 </Button>
//                             </form>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//             <Footer />
//         </div>
//     );
// }

// // Default export
// export default Signup;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// --- MOCK UI COMPONENTS ---
const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg p-6">{children}</div>
);
const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-center">{children}</h2>
);
const CardContent = ({ children }) => <div>{children}</div>;
const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);
const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
  >
    {children}
  </button>
);
const Checkbox = (props) => (
  <input
    type="checkbox"
    {...props}
    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
);
const Header = () => (
  <header className="p-4 bg-white shadow-sm">
    <div className="text-xl font-bold">GigHive</div>
  </header>
);
const Footer = () => (
  <footer className="p-4 bg-gray-100 text-center text-sm text-gray-600">
    © 2025 GigHive
  </footer>
);

export function Signup() {
  const [userType, setUserType] = useState("student"); // 'student' or 'employer'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setSuccess("");
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms of service.");
      return;
    }

    setLoading(true);

    try {
      const API_URI = "http://localhost:5001/api/user/register";

      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: userType, // ✅ This is critical for backend JWT role embedding
      };

      console.log("📤 Sending signup payload:", payload);
      await axios.post(API_URI, payload);
      console.log("✅ User registration successful");

      setSuccess("Registration successful! You can now log in.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      });
    } catch (err) {
      console.error("❌ Signup error:", err.response);
      const errorMsg =
        err.response?.data?.msg ||
        "An error occurred during sign up. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <p className="bg-red-100 text-red-700 p-3 rounded-md text-center">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="bg-green-100 text-green-700 p-3 rounded-md text-center">
                    {success}
                  </p>
                )}

                {/* User Type Tabs */}
                <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setUserType("student")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      userType === "student" ? "bg-white shadow" : ""
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("employer")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      userType === "employer" ? "bg-white shadow" : ""
                    }`}
                  >
                    Employer
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex items-start">
                  <Checkbox
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-500">
                      I agree to the Terms of Service
                    </label>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Log in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;

// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { Header } from '../layout/Header';
// import { Footer } from '../layout/Footer';
// import { Eye, EyeOff } from 'lucide-react';
// import axios from 'axios';

// export function Login({ onLogin }) {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [userType, setUserType] = useState("student");

//   const [loginStep, setLoginStep] = useState("credentials");
//   const [otp, setOtp] = useState("");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleInputChange = (e) => {
//     setError("");
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleCredentialsSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const API_URI = "http://localhost:5001/api/user/login";
//       const payload = { ...formData, userType };

//       console.log("📤 Sending login payload:", payload);

//       const response = await axios.post(API_URI, payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       console.log("📥 Server response:", response.data);

//       if (response.data.token && response.data.user) {
//         localStorage.setItem("token", response.data.token);
//         console.log("✅ Token saved:", localStorage.getItem("token"));

//         if (!localStorage.getItem("token")) {
//           alert("Login succeeded but token is missing. Please try again.");
//           return;
//         }

//         onLogin({ ...response.data.user, token: response.data.token }, response.data.user.role);
//         navigate("/dashboard");
//         window.location.reload(); 
//         return;
//       }

//       if (response.data.success) {
//         setLoginStep("otp");
//         alert(response.data.msg || "OTP sent successfully!");
//       } else {
//         setError(response.data.msg || "Something went wrong.");
//       }
//     } catch (err) {
//       console.error("Axios error response:", err.response);

//       if (err.response) {
//         const { status, data } = err.response;
//         setError(data?.msg || data?.error || `Login failed with status ${status}.`);
//       } else if (err.request) {
//         setError("No response from server. Try again later.");
//       } else {
//         setError(err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleOtpSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     const API_URI = "http://localhost:5001/api/user/verify-otp";
//     const payload = { email: formData.email, otp };

//     console.log("📤 Sending OTP payload:", payload);

//     const response = await axios.post(API_URI, payload, {
//       headers: { "Content-Type": "application/json" },
//     });

//     console.log("📥 OTP server response:", response.data);

//     const { token, user } = response.data;

//     if (!token || !user) {
//       console.warn("⚠️ Missing token or user in response:", response.data);
//       throw new Error("Invalid OTP response from server.");
//     }

//     localStorage.setItem("token", token);
//     const savedToken = localStorage.getItem("token");
//     console.log("✅ Token saved after OTP:", savedToken);

//     // ✅ Check if token is a valid JWT format
//     const isValidJWT = savedToken && typeof savedToken === "string" && savedToken.split(".").length === 3;

//     if (!isValidJWT) {
//       alert("OTP verified but token is malformed or missing. Please try again.");
//       return;
//     }

//     onLogin({ ...user, token }, user.role);
//     navigate("/dashboard");
//     window.location.reload(); 
//   } catch (err) {
//     console.error("Axios OTP error response:", err.response);

//     if (err.response) {
//       const { status, data } = err.response;
//       setError(data?.msg || data?.error || `OTP verification failed with status ${status}.`);
//     } else if (err.request) {
//       setError("No response from server. Try again later.");
//     } else {
//       setError(err.message);
//     }
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <Header />

//       <div className="flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-md">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-center">
//                 {loginStep === "credentials" ? "Sign In" : "Enter OTP"}
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               {error && (
//                 <p className="text-red-500 text-center mb-4">{error}</p>
//               )}

//               {loginStep === "credentials" ? (
//                 <form onSubmit={handleCredentialsSubmit} className="space-y-4">
//                   <Tabs value={userType} onValueChange={setUserType} className="mb-6">
//                     {/* Optional: Add tab buttons for student/employer */}
//                   </Tabs>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">Email</label>
//                     <Input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">Password</label>
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       required
//                     />
//                     <Button
//                       type="button"
//                       variant="link"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? "Hide" : "Show"}
//                     </Button>
//                   </div>

//                   <Button type="submit" className="w-full" disabled={loading}>
//                     {loading ? "Sending OTP..." : "Sign In"}
//                   </Button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleOtpSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-2">One-Time Password</label>
//                     <Input
//                       type="text"
//                       name="otp"
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value)}
//                       placeholder="Enter the 6-digit code from your email"
//                       required
//                       maxLength="6"
//                     />
//                   </div>

//                   <Button type="submit" className="w-full" disabled={loading}>
//                     {loading ? "Verifying..." : "Verify & Sign In"}
//                   </Button>

//                   <Button variant="link" onClick={() => setLoginStep("credentials")}>
//                     Back to login
//                   </Button>
//                 </form>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Tabs } from '../ui/tabs';
// import { Header } from '../layout/Header';
// import { Footer } from '../layout/Footer';
// import axios from 'axios';

// // ✅ JWT decoder
// import {jwtDecode} from 'jwt-decode';

// function decodeJWT(token) {
//   try {
//     return jwtDecode(token); // Automatically handles base64 and structure
//   } catch {
//     return null;
//   }
// }

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs } from '../ui/tabs';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

export function Login({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("student");
  const [loginStep, setLoginStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URI = "http://localhost:5001/api/user/login";
      const payload = { ...formData, userType };

      console.log("📤 Sending login payload:", payload);

      const response = await axios.post(API_URI, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      console.log("📥 Server response:", response.data);

      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        console.log("✅ Token saved:", response.data.token);

        onLogin({ ...response.data.user, token: response.data.token }, response.data.user.role);
        navigate("/dashboard", { replace: true });
        return;
      }

      if (response.data.success) {
        setLoginStep("otp");
        toast.success(response.data.msg || "OTP sent successfully!");
      } else {
        setError(response.data.msg || "Something went wrong.");
      }
    } catch (err) {
      console.error("Axios error:", {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config,
      });

      if (err.response) {
        const { status, data } = err.response;
        setError(data?.msg || data?.error || `Login failed with status ${status}.`);
      } else if (err.request) {
        setError("Network error or server unreachable. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URI = "http://localhost:5001/api/user/verify-otp";
      const payload = { email: formData.email, otp };

      console.log("📤 Sending OTP payload:", payload);

      const response = await axios.post(API_URI, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      console.log("📥 OTP server response:", response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        console.warn("⚠️ Missing token or user in response:", response.data);
        throw new Error("Invalid OTP response from server.");
      }

      localStorage.setItem("token", token);
      console.log("✅ Token saved after OTP:", token);

      const isValidJWT = token && typeof token === "string" && token.split(".").length === 3;
      if (!isValidJWT) {
        toast.error("OTP verified but token is malformed or missing. Please try again.");
        setLoading(false);
        return;
      }

      onLogin({ ...user, token }, user.role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Axios OTP error:", {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config,
      });

      if (err.response) {
        const { status, data } = err.response;
        setError(data?.msg || data?.error || `OTP verification failed with status ${status}.`);
      } else if (err.request) {
        setError("Network error or server unreachable. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {loginStep === "credentials" ? "Sign In" : "Enter OTP"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}

              {loginStep === "credentials" ? (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <label className="block text-sm font-medium mb-2">Select Account Type</label>
                  <Tabs value={userType} onValueChange={setUserType} className="mb-6" />

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending OTP..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">One-Time Password</label>
                    <Input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the 6-digit code from your email"
                      required
                      maxLength="6"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <Button variant="link" onClick={() => setLoginStep("credentials")}>
                    Back to login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

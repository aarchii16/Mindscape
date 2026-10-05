import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Shield,
  CheckCircle,
  MapPin,
  Phone,
  Video,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, API_BASE } from "@/lib/api";

interface Slot {
  _id: string;
  counselor: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    credentials?: string;
    specializations?: string[];
  };
  startTime: string;
  endTime: string;
  type: string;
  isAvailable: boolean;
  notes?: string;
}

interface Counselor {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  credentials: string;
  specializations: string[];
}

const sessionTypes = [
  { id: 'in-person', name: 'In-Person', icon: MapPin, description: 'Visit our campus wellness center' },
  { id: 'video', name: 'Video Call', icon: Video, description: 'Secure online session' },
  { id: 'phone', name: 'Phone Call', icon: Phone, description: 'Audio-only session' },
  { id: 'chat', name: 'Text Chat', icon: MessageSquare, description: 'Secure messaging session' }
];

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(false);
  const [counselorsLoading, setCounselorsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedType, setSelectedType] = useState<string>('video');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    concern: '',
    urgency: 'normal'
  });
  const [filters, setFilters] = useState({
    counselorId: 'all',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to tomorrow
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    type: 'all'
  });

  const navigate = useNavigate();

  // Fetch counselors on mount
  useEffect(() => {
    fetchCounselors();
  }, []);

  // Fetch available slots
  useEffect(() => {
    fetchSlots();
  }, [filters]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.counselorId && filters.counselorId !== 'all') queryParams.append('counselorId', filters.counselorId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);

      const res = await fetchWithAuth(`${API_BASE}/api/booking/slots?${queryParams}`);

      if (res.ok) {
        const data = await res.json();
        setSlots(data.data || []);
      } else if (res.status === 401) {
        alert('Session expired. Please sign in again.');
        navigate('/auth');
        return;
      } else {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      setCounselorsLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/api/users/counselors/all`);

      if (res.ok) {
        const data = await res.json();
        setCounselors(data.data || []);
      } else if (res.status === 401) {
        alert('Session expired. Please sign in again.');
        navigate('/auth');
        return;
      } else {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
      }
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    } finally {
      setCounselorsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/booking/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          type: selectedSlot.type,
          notes: `${selectedType}; anonymous=${isAnonymous}; concern=${formData.concern}; urgency=${formData.urgency}; name=${formData.name}; email=${formData.email}`
        })
      });

      if (res.status === 401) {
        alert('Session expired. Please sign in again.');
        navigate('/auth');
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Failed to book (${res.status})`);
      }

      const payload = {
        counselorId: selectedSlot.counselor._id,
        counselorName: `${selectedSlot.counselor.firstName} ${selectedSlot.counselor.lastName}`,
        date: new Date(selectedSlot.startTime).toISOString().split('T')[0],
        time: new Date(selectedSlot.startTime).toLocaleTimeString(),
        type: selectedType,
        anonymous: isAnonymous,
        ...formData,
        appointmentId: data?.data?.id || undefined,
      };

      navigate('/booking/success', { state: payload });
    } catch (err: any) {
      alert(err?.message || 'Failed to book appointment.');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Book Your Session</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Schedule a confidential appointment with our licensed mental health professionals
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Badge variant="secondary" className="glass">
              <Shield className="w-3 h-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="glass">
              <CheckCircle className="w-3 h-3 mr-1" />
              Licensed Professionals
            </Badge>
            <Badge variant="secondary" className="glass">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Same Day Available
            </Badge>
          </div>
        </div>

        {/* Counselors Overview */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Our Licensed Counselors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {counselorsLoading ? (
              <div className="text-center py-8">Loading counselors...</div>
            ) : counselors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No counselors available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {counselors.map((counselor) => (
                  <div
                    key={counselor._id}
                    className="p-4 rounded-xl border border-border/30 bg-card/50 hover-glass transition-all"
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">
                        {counselor.firstName} {counselor.lastName}
                      </h3>
                      {counselor.credentials && (
                        <p className="text-xs text-muted-foreground mt-1">{counselor.credentials}</p>
                      )}
                    </div>
                    {counselor.specializations && counselor.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {counselor.specializations.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {counselor.bio && (
                      <p className="text-xs text-muted-foreground text-center line-clamp-3">{counselor.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-primary" />
                  Session Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover-glass ${
                        selectedType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/30'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <div className="flex items-center mb-2">
                        <type.icon className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-semibold">{type.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Filter Available Slots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Counselor</label>
                    <Select value={filters.counselorId} onValueChange={(value) => setFilters({...filters, counselorId: value})}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="All counselors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All counselors</SelectItem>
                        {counselors.filter(counselor => counselor._id && counselor._id.trim()).map((counselor) => (
                          <SelectItem key={counselor._id} value={counselor._id}>
                            {counselor.firstName} {counselor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      className="glass"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="glass"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Session Type</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Slots */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No slots available for the selected filters.
                    <br />
                    <span className="text-sm">Try adjusting your date range or counselor selection.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slots.map((slot) => (
                      <div
                        key={slot._id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover-glass ${
                          selectedSlot?._id === slot._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/30'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <User className="w-5 h-5 mr-3 text-primary" />
                              <div>
                                <h3 className="font-semibold">
                                  {slot.counselor.firstName} {slot.counselor.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground capitalize">{slot.type}</p>
                              </div>
                            </div>
                            {slot.counselor.credentials && (
                              <p className="text-xs text-muted-foreground mb-1">{slot.counselor.credentials}</p>
                            )}
                            {slot.counselor.specializations && slot.counselor.specializations.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {slot.counselor.specializations.slice(0, 3).map((spec, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {slot.counselor.bio && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{slot.counselor.bio}</p>
                            )}
                            {slot.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{slot.notes}"</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold">
                              {new Date(slot.startTime).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    Your Information
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`glass ${isAnonymous ? 'bg-primary/10' : ''}`}
                  >
                    {isAnonymous ? 'Anonymous Mode' : 'Use Full Name'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAnonymous && (
                  <>
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="glass"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="glass"
                    />
                  </>
                )}
                
                <Textarea
                  placeholder="Brief description of your concern (optional)"
                  value={formData.concern}
                  onChange={(e) => setFormData({...formData, concern: e.target.value})}
                  className="glass min-h-20"
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Urgency Level</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="w-full p-3 rounded-xl glass border border-border/30"
                  >
                    <option value="normal">Normal - Within a week</option>
                    <option value="urgent">Urgent - Within 24-48 hours</option>
                    <option value="crisis">Crisis - Immediate attention needed</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSlot && (
                  <>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedSlot.counselor.firstName} {selectedSlot.counselor.lastName}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{new Date(selectedSlot.startTime).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(selectedSlot.startTime).toLocaleTimeString()} - {new Date(selectedSlot.endTime).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Badge variant="outline" className="capitalize">
                        {selectedSlot.type}
                      </Badge>
                    </div>
                  </>
                )}

                {selectedType && (
                  <div className="flex items-center">
                    {(() => {
                      const selectedSessionType = sessionTypes.find(t => t.id === selectedType);
                      const IconComponent = selectedSessionType?.icon;
                      return IconComponent ? (
                        <IconComponent className="w-4 h-4 mr-2 text-muted-foreground" />
                      ) : null;
                    })()}
                    <span className="text-sm">
                      {sessionTypes.find(t => t.id === selectedType)?.name}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Cost:</span>
                    <span className="text-success">Free for Students</span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl hover-glass"
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>

            {/* Crisis Support */}
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you're having thoughts of self-harm or suicide, please reach out immediately:
                </p>
                <div className="space-y-2 text-sm">
                  <div>🇮🇳 iCall: <strong>14416</strong></div>
                  <div>🇮🇳 Samaritans: <strong>91529 87821</strong></div>
                </div>
                <Button variant="destructive" size="sm" className="w-full mt-4">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Services: 112
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
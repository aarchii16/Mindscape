import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth, API_BASE } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { User, Lock, Heart, Calendar } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    institution: "",
    yearOfStudy: "",
    preferredLanguage: "en",
  });

  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, apptRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/users/profile`),
          fetchWithAuth(`${API_BASE}/api/booking/appointments`),
        ]);

        const profileData = await profileRes.json().catch(() => null);
        if (profileRes.ok && profileData?.data) {
          setProfile(profileData.data);
          setForm({
            firstName: profileData.data.firstName || "",
            lastName: profileData.data.lastName || "",
            institution: profileData.data.institution || "",
            yearOfStudy: profileData.data.yearOfStudy || "",
            preferredLanguage: profileData.data.preferredLanguage || profileData.data?.preferences?.language || "en",
          });
        }

        if (apptRes.ok) {
          const apptData = await apptRes.json().catch(() => null);
          setAppointments(apptData?.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          institution: form.institution,
          yearOfStudy: form.yearOfStudy,
          preferredLanguage: form.preferredLanguage,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Update failed");
      setProfile(data?.data || profile);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error("Please fill password fields");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwdForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Password update failed");
      setPwdForm({ currentPassword: "", newPassword: "" });
      toast.success("Password updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update password");
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;

  const latestScore = profile?.wellness?.latestWellnessScore ?? 0;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold gradient-text mb-2">Your Wellness Profile</h1>
          <p className="text-xl text-muted-foreground">Track your mental health journey and progress</p>
        </div>

        <Card className="glass-card animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User /> Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">First Name</label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="glass" />
              </div>
              <div>
                <label className="text-sm">Last Name</label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="glass" />
              </div>
              <div>
                <label className="text-sm">Preferred Language</label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                  className="w-full p-3 rounded-xl glass border border-border/30"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Institution</label>
                <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="glass" />
              </div>
              <div>
                <label className="text-sm">Year of Study</label>
                <Input value={form.yearOfStudy} onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })} className="glass" />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="rounded-xl hover:scale-105 transition-transform">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              className="glass"
            />
            <Input
              type="password"
              placeholder="New password (min 8 chars)"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              className="glass"
            />
            <Button onClick={changePassword} disabled={changingPwd} className="rounded-xl hover:scale-105 transition-transform">
              {changingPwd ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart /> Wellness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Latest Wellness Score</span>
              <Badge className={`text-xl font-bold ${latestScore >= 70 ? "bg-success text-white" : latestScore >= 40 ? "bg-yellow-500" : "bg-destructive text-white"}`}>
                {latestScore}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Update your score by completing assessments on the Assessments page.
            </div>
            <a href="/assessments">
              <Button variant="outline" className="rounded-xl mt-2 hover:scale-105 transition-transform">Go to Assessments</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar /> Previously Booked Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No past sessions found.</div>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a._id} className="p-3 rounded-xl border border-border/30 glass hover-glass transition-all">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="text-sm"><span className="font-medium">Type:</span> {a.type}</div>
                      <div className="text-sm"><span className="font-medium">Status:</span> <Badge variant="secondary">{a.status}</Badge></div>
                      <div className="text-sm text-muted-foreground">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                    {a.notes && (
                      <div className="text-sm mt-1">
                        <div className="font-medium">Notes</div>
                        <div className="mt-1">
                          {(() => {
                            const raw = String(a.notes);
                            let entries: [string, any][] = [];
                            try {
                              const obj = JSON.parse(raw);
                              if (obj && typeof obj === 'object') {
                                entries = Object.entries(obj as any);
                              }
                            } catch {
                              // parse semicolon-separated key=value pairs
                              const parts = raw.split(';').map(s => s.trim()).filter(Boolean);
                              if (parts.length > 1 || raw.includes('=')) {
                                entries = parts.map(pair => {
                                  const [k, ...rest] = pair.split('=');
                                  return [k?.trim() || 'note', rest.join('=').trim()];
                                });
                              } else {
                                entries = [['note', raw]];
                              }
                            }
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                {entries.map(([k, v], i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{String(k).replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
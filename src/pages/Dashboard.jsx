import { useDashboardData } from "../hooks/useDashboardData";
import SplashScreen from "../splashscreen/SplashScreen";
import Sidebar from "../components/Sidebar";
import MemberCard from "../components/MemberCard";
import DomainsSection from "../components/DomainsSection";
import AdminPanel from "../components/AdminPanel";
import Header from "../components/Header";

function Dashboard() {
    const {
        splashCompleted,
        handleSplashComplete,
        session,
        profile,
        orgInfo,
        members,
        selectedMember,
        setSelectedMember,
        domains,
        newDomain,
        setNewDomain,
        handleAddDomain,
        handleSignOut,
        isLoading,
        errors,
        isAdmin,
    } = useDashboardData();

    if (!splashCompleted) return <SplashScreen onComplete={handleSplashComplete} />;
    if (!session)
        return (
            <div className="flex justify-center items-center h-screen">
                <button
                    onClick={() => navigate("/sign-in")}
                    className="bg-blue-500 text-white p-4 rounded"
                >
                    Перейти на страницу логина
                </button>
            </div>
        );

    return (
        <div className="main-container relative">
            <Header profile={profile} handleSignOut={handleSignOut} />
            <div className="flex h-screen relative z-10">
                <Sidebar
                    members={members}
                    onSelectMember={setSelectedMember}
                    orgInfo={orgInfo}
                    loading={isLoading.members}
                    error={errors.members}
                />

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {errors.org && <ErrorBanner message={errors.org} />}
                    {errors.members && <ErrorBanner message={errors.members} />}
                    {errors.domains && <ErrorBanner message={errors.domains} />}

                    {selectedMember && (
                        <div className="mb-4">
                            <MemberCard member={selectedMember} onClose={() => setSelectedMember(null)} />
                        </div>
                    )}

                    {isAdmin && <AdminPanel />}

                    <DomainsSection
                        domains={domains}
                        isLoading={isLoading.domains}
                        newDomain={newDomain}
                        setNewDomain={setNewDomain}
                        onAddDomain={handleAddDomain}
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

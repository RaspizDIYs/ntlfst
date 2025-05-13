import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Octokit } from "@octokit/rest";
import { supabase } from "../auth/api/supabase/client";
import { getDomains, addDomain as addDomainAPI } from "../components/lookup";

const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

export function useDashboardData() {
    const navigate = useNavigate();

    const [orgInfo, setOrgInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [splashCompleted, setSplashCompleted] = useState(false);
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState("");

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState({
        org: true,
        members: true,
        domains: true,
    });

    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchAuth = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                setSession(data.session);
                const { user } = data.session;
                setProfile({
                    username: user.user_metadata?.full_name || user.email,
                    avatar_url: user.user_metadata?.avatar_url,
                });
                setIsAdmin(user.email.endsWith("@admin.com")); // условие для админа
            }
        };

       void fetchAuth();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const loadData = async () => {
            try {
                const [orgRes, membersRes, domainsRes] = await Promise.allSettled([
                    octokit.orgs.get({ org: "RaspizDIYs" }),
                    octokit.orgs.listMembers({ org: "RaspizDIYs" }),
                    getDomains({ signal }),
                ]);

                if (orgRes.status === "fulfilled") {
                    const org = orgRes.value.data;
                    setOrgInfo({
                        name: "raspizdiy",
                        avatar_url: org.avatar_url,
                        html_url: org.html_url,
                    });
                } else {
                    setErrors((prev) => ({ ...prev, org: orgRes.reason.message }));
                }

                if (membersRes.status === "fulfilled") {
                    setMembers(membersRes.value.data);
                } else {
                    setErrors((prev) => ({ ...prev, members: membersRes.reason.message }));
                }

                if (domainsRes.status === "fulfilled") {
                    setDomains(domainsRes.value);
                } else {
                    setErrors((prev) => ({ ...prev, domains: domainsRes.reason.message }));
                }
            } finally {
                setIsLoading({ org: false, members: false, domains: false });
            }
        };

       void loadData();

        return () => controller.abort();
    }, []);

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return;
        try {
            await addDomainAPI(newDomain.trim());
            const updated = await getDomains();
            setDomains(updated);
            setNewDomain("");
        } catch (error) {
            setErrors((prev) => ({ ...prev, domains: error.message }));
        }
    };

    return {
        splashCompleted,
        handleSplashComplete: () => setSplashCompleted(true),
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
        handleSignOut: async () => {
            await supabase.auth.signOut();
            navigate("/");
        },
        errors,
        isLoading,
        isAdmin,
    };
}

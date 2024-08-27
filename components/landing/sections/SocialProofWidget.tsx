import React, { useState, useEffect } from 'react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function SocialProofWidget({ lang }: Props, ) {
  

  const [stats, setStats] = useState({
    activeUsers: 0,
    projectsCreated: 0,
  });
  const { t } = useDictionary()

  useEffect(() => {
    // Simulating API call to get real-time stats
    const fetchStats = () => {
      // Replace with actual API call
      setStats({
        activeUsers: Math.floor(Math.random() * 10000),
        projectsCreated: Math.floor(Math.random() * 100000),
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">{t('social_proof.title')}</h3>
      <p>{t('social_proof.active_users')} &quot; count: &quot; {Number(stats.activeUsers).toLocaleString() }</p>
      <p>{t('social_proof.projects_created')} &quot; count: &quot; {stats.projectsCreated.toLocaleString() }</p>
    </div>
  );
}

export default SocialProofWidget;

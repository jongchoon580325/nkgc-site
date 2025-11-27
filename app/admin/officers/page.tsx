'use client';

import { useState } from 'react';
import CurrentOfficersAdmin from './current/page';
import PastOfficersAdmin from './past/page';

type TabType = 'current' | 'past';

export default function AdminOfficersPage() {
    const [activeTab, setActiveTab] = useState<TabType>('current');

    return (
        <div className="space-y-6">
            {/* Tab Menu */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'current'
                                ? 'bg-primary-blue text-white border-b-2 border-primary-blue'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        현직임원 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'past'
                                ? 'bg-primary-blue text-white border-b-2 border-primary-blue'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        역대임원 관리
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'current' && <CurrentOfficersAdmin />}
                {activeTab === 'past' && <PastOfficersAdmin />}
            </div>
        </div>
    );
}

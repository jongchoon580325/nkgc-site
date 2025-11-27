'use client';

import { useState } from 'react';
import GreetingAdmin from './greeting/page';
import ContactAdmin from './contact/page';

type TabType = 'greeting' | 'contact';

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState<TabType>('greeting');

    return (
        <div className="space-y-6">
            {/* Tab Menu */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('greeting')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'greeting'
                                ? 'bg-primary-blue text-white border-b-2 border-primary-blue'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        인사말 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'contact'
                                ? 'bg-primary-blue text-white border-b-2 border-primary-blue'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        연락처 관리
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'greeting' && <GreetingAdmin />}
                {activeTab === 'contact' && <ContactAdmin />}
            </div>
        </div>
    );
}

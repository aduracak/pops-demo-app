import React from 'react';
import {
  BarChart3,
  History,
  PlusCircle,
  QrCode,
  ScanLine,
  ShieldCheck,
  Ticket,
  User,
} from 'lucide-react';
import { AppRole } from '../types/pops';
import { AnimatedCounter } from './AnimatedCounter';
import { OwnerTab } from './OwnerDashboardView';

export type CustomerTab = 'coupons' | 'my_qr' | 'profile';
export type StaffTab = 'scanner' | 'history';

interface BubbleNavbarProps {
  role: AppRole;
  customerTab: CustomerTab;
  staffTab: StaffTab;
  ownerTab: OwnerTab;
  points: number;
  hasWaitingCustomerQr: boolean;
  onSelectCustomerTab: (tab: CustomerTab) => void;
  onSelectStaffTab: (tab: StaffTab) => void;
  onSelectOwnerTab: (tab: OwnerTab) => void;
  onTriggerInstantStaffScan: () => void;
}

export const BubbleNavbar: React.FC<BubbleNavbarProps> = ({
  role,
  customerTab,
  staffTab,
  ownerTab,
  points,
  hasWaitingCustomerQr,
  onSelectCustomerTab,
  onSelectStaffTab,
  onSelectOwnerTab,
  onTriggerInstantStaffScan,
}) => {
  if (role === 'staff') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[400px] z-40">
        <div className="bubble-nav-shell relative grid grid-cols-3 items-center">
          {/* Left Tab: POS Terminal */}
          <button
            type="button"
            onClick={() => onSelectStaffTab('scanner')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 select-none ${
              staffTab === 'scanner'
                ? 'bubble-tab-sunken text-[#FAF8F5]'
                : 'bubble-tab-raised text-[#8E857D] hover:text-[#D5CEC7]'
            }`}
          >
            {staffTab === 'scanner' && (
              <span className="w-6 h-1 rounded-full bg-[#DF3B16] mb-1 transition-all duration-300" />
            )}
            <QrCode
              className={`w-5 h-5 ${
                staffTab === 'scanner'
                  ? 'animate-icon-spring text-[#DF3B16]'
                  : 'transition-transform duration-200'
              }`}
            />
            <span className="text-[11px] font-bold mt-1 tracking-tight">
              Kasa
            </span>
          </button>

          {/* Center Giant Scan Action Button */}
          <div className="flex flex-col items-center justify-center relative">
            {hasWaitingCustomerQr && (
              <span className="absolute -top-8 w-[74px] h-[74px] rounded-full bg-[#DF3B16]/35 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onClick={onTriggerInstantStaffScan}
              className="staff-center-scan-btn -mt-8 w-[74px] h-[74px] rounded-full flex flex-col items-center justify-center text-white relative select-none"
            >
              {hasWaitingCustomerQr && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#1A1715]" />
              )}
              <ScanLine className="w-7 h-7 stroke-[2.4]" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">
                Skeniraj
              </span>
            </button>
          </div>

          {/* Right Tab: History */}
          <button
            type="button"
            onClick={() => onSelectStaffTab('history')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 select-none ${
              staffTab === 'history'
                ? 'bubble-tab-sunken text-[#FAF8F5]'
                : 'bubble-tab-raised text-[#8E857D] hover:text-[#D5CEC7]'
            }`}
          >
            {staffTab === 'history' && (
              <span className="w-6 h-1 rounded-full bg-[#DF3B16] mb-1 transition-all duration-300" />
            )}
            <History
              className={`w-5 h-5 ${
                staffTab === 'history'
                  ? 'animate-icon-spring text-[#DF3B16]'
                  : 'transition-transform duration-200'
              }`}
            />
            <span className="text-[11px] font-bold mt-1 tracking-tight">
              Evidencija
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (role === 'owner') {
    const ownerTabs: {
      id: OwnerTab;
      label: string;
      Icon: React.FC<{ className?: string }>;
    }[] = [
      { id: 'overview', label: 'Pregled', Icon: BarChart3 },
      { id: 'create_coupon', label: '+ Kupon', Icon: PlusCircle },
      { id: 'audit_log', label: 'Kontrola', Icon: ShieldCheck },
    ];

    const activeOwnerIdx = Math.max(
      0,
      ownerTabs.findIndex((t) => t.id === ownerTab)
    );

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[400px] z-40">
        <div className="bubble-nav-shell relative grid grid-cols-3 items-center overflow-hidden">
          <div
            className="bubble-sunken-slider absolute top-[7px] bottom-[7px] left-[7px] w-[calc((100%-14px)/3)] pointer-events-none"
            style={{
              transform: `translateX(${activeOwnerIdx * 100}%) translateY(2px) scale(0.97)`,
            }}
          />

          {ownerTabs.map(({ id, label, Icon }) => {
            const isActive = ownerTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectOwnerTab(id)}
                className={`relative z-10 flex flex-col items-center justify-center py-2.5 px-2 select-none transition-all duration-300 ${
                  isActive
                    ? 'translate-y-[2px] text-[#FAF8F5]'
                    : 'translate-y-0 text-[#8E857D] hover:text-[#D5CEC7] active:scale-95'
                }`}
              >
                <span
                  className={`h-1 rounded-full bg-[#DF3B16] mb-1 transition-all duration-300 ${
                    isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                  }`}
                />
                <Icon
                  key={isActive ? `${id}-active` : `${id}-idle`}
                  className={`w-5 h-5 ${
                    isActive
                      ? 'animate-icon-spring text-white'
                      : 'transition-transform duration-200'
                  }`}
                />
                <span
                  className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${
                    isActive ? 'font-extrabold text-white' : 'font-semibold'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Customer Bubble Navbar with Sliding Sunken Cavity
  const tabs: {
    id: CustomerTab;
    label: string;
    hasPointsBadge?: boolean;
    Icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'coupons', label: 'Kuponi', Icon: Ticket },
    { id: 'my_qr', label: 'Moj QR', Icon: QrCode },
    { id: 'profile', label: 'Nagrade', hasPointsBadge: true, Icon: User },
  ];

  const activeIdx = Math.max(
    0,
    tabs.findIndex((t) => t.id === customerTab)
  );

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[400px] z-40">
      <div className="bubble-nav-shell relative grid grid-cols-3 items-center overflow-hidden">
        <div
          className="bubble-sunken-slider absolute top-[7px] bottom-[7px] left-[7px] w-[calc((100%-14px)/3)] pointer-events-none"
          style={{
            transform: `translateX(${activeIdx * 100}%) translateY(2px) scale(0.97)`,
          }}
        />

        {tabs.map(({ id, label, hasPointsBadge, Icon }) => {
          const isActive = customerTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCustomerTab(id)}
              className={`relative z-10 flex flex-col items-center justify-center py-2.5 px-2 select-none transition-all duration-300 ${
                isActive
                  ? 'translate-y-[2px] text-[#FAF8F5]'
                  : 'translate-y-0 text-[#8E857D] hover:text-[#D5CEC7] active:scale-95'
              }`}
            >
              <span
                className={`h-1 rounded-full bg-[#DF3B16] mb-1 transition-all duration-300 ${
                  isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                }`}
              />

              <div className="relative flex items-center justify-center">
                <Icon
                  key={isActive ? `${id}-active` : `${id}-idle`}
                  className={`w-5 h-5 ${
                    isActive
                      ? 'animate-icon-spring text-white'
                      : 'transition-transform duration-200'
                  }`}
                />
                {hasPointsBadge && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold transition-colors duration-300 ${
                      isActive
                        ? 'bg-[#DF3B16] text-white'
                        : 'bg-[#26221F] text-[#C4BCB3]'
                    }`}
                  >
                    <AnimatedCounter value={points} />b
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${
                  isActive ? 'font-extrabold text-white' : 'font-semibold'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

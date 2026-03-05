import { Member, Service, IncomeRecord } from "@/types";
import { generateId } from "@/lib/format";

const today = new Date();
const d = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

export const seedMembers: Member[] = [
  { id: generateId(), fullName: "Abena Mensah", phone: "024-555-1234", email: "abena@email.com", dateJoined: "2023-03-15", active: true, notes: "" },
  { id: generateId(), fullName: "Kofi Asante", phone: "020-555-5678", email: "kofi@email.com", dateJoined: "2022-08-20", active: true, notes: "Deacon" },
  { id: generateId(), fullName: "Akua Boateng", phone: "027-555-9012", email: "akua@email.com", dateJoined: "2024-01-10", active: true, notes: "" },
  { id: generateId(), fullName: "Emmanuel Darko", phone: "055-555-3456", email: "emmanuel@email.com", dateJoined: "2021-11-05", active: true, notes: "Elder" },
];

export function createSeedData() {
  const members = [...seedMembers];
  const m = members;

  const services: Service[] = [
    { id: generateId(), date: d(14), type: "Sunday First Service", title: "Walking in Faith", preacher: "Pastor Mensah", attendance: 120, notes: "" },
    { id: generateId(), date: d(7), type: "Sunday Second Service", title: "The Blessing of Giving", preacher: "Pastor Mensah", attendance: 95, notes: "" },
    { id: generateId(), date: d(3), type: "Midweek Service", title: "Prayer & Intercession", preacher: "Elder Darko", attendance: 45, notes: "" },
  ];

  const income: IncomeRecord[] = [
    { id: generateId(), date: d(14), type: "Offering", amount: 2350, serviceId: services[0].id, recordedBy: "Secretary", notes: "" },
    { id: generateId(), date: d(14), type: "Tithe", amount: 1800, serviceId: services[0].id, recordedBy: "Secretary", notes: "", memberContributions: [
      { memberName: m[0].fullName, memberId: m[0].id, amount: 500 },
      { memberName: m[1].fullName, memberId: m[1].id, amount: 800 },
      { memberName: m[3].fullName, memberId: m[3].id, amount: 500 },
    ]},
    { id: generateId(), date: d(7), type: "Offering", amount: 1950, serviceId: services[1].id, recordedBy: "Secretary", notes: "" },
    { id: generateId(), date: d(7), type: "Tithe", amount: 2200, serviceId: services[1].id, recordedBy: "Secretary", notes: "", memberContributions: [
      { memberName: m[0].fullName, memberId: m[0].id, amount: 600 },
      { memberName: m[2].fullName, memberId: m[2].id, amount: 400 },
      { memberName: m[3].fullName, memberId: m[3].id, amount: 1200 },
    ]},
    { id: generateId(), date: d(7), type: "Fundraising", amount: 3500, serviceId: services[1].id, recordedBy: "Secretary", notes: "Building fund", memberContributions: [
      { memberName: m[1].fullName, memberId: m[1].id, amount: 2000 },
      { memberName: m[2].fullName, memberId: m[2].id, amount: 1500 },
    ]},
    { id: generateId(), date: d(3), type: "Offering", amount: 850, serviceId: services[2].id, recordedBy: "Secretary", notes: "" },
    { id: generateId(), date: d(3), type: "BENMP", amount: 1500, serviceId: services[2].id, recordedBy: "Secretary", notes: "", memberContributions: [
      { memberName: m[0].fullName, memberId: m[0].id, amount: 400 },
      { memberName: m[1].fullName, memberId: m[1].id, amount: 600 },
      { memberName: m[3].fullName, memberId: m[3].id, amount: 500 },
    ]},
    { id: generateId(), date: d(1), type: "Other", amount: 600, recordedBy: "Secretary", notes: "Donation from visitor", memberContributions: [
      { memberName: "Guest Donor", amount: 600 },
    ]},
  ];

  return { members, services, income };
}

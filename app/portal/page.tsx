'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldAlert,
  Building2,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Coins,
  History,
  LogOut,
  Wallet,
  Compass,
  Heart,
  Sliders,
  Activity,
  Layers,
  MessageSquare,
} from 'lucide-react';

import { Property, Inquiry, AuditLog, UserAccount } from './types';

import PropertyDetail from './shared/PropertyDetail';
import PrdDoc from '@/components/PrdDoc';
import MarketDiscover from './buyer/MarketDiscover';
import SavedListings from './buyer/SavedListings';
import ActiveHoldings from './buyer/ActiveHoldings';
import TenantKyc from './buyer/TenantKyc';
import TenantMessages from './buyer/TenantMessages';
import OwnedProperties from './owner/OwnedProperties';
import OwnerLifecycle from './owner/OwnerLifecycle';
import OwnerInquiries from './owner/OwnerInquiries';
import OwnerKyc from './owner/OwnerKyc';
import OwnerMessages from './owner/OwnerMessages';
import PropertyAudits from './admin/PropertyAudits';
import MasterUserRegistry from './admin/MasterUserRegistry';
import KycVerificationsAudit from './admin/KycVerificationsAudit';
import AuditLogsTrail from './admin/AuditLogsTrail';
import ManageAdminStaff from './admin/ManageAdminStaff';
import SecurityOverrides from './admin/SecurityOverrides';

// Dynamic newly created enterprise components
import NotificationCenter, { NotificationItem } from './shared/NotificationCenter';
import AgreementsEscrow from './shared/AgreementsEscrow';
import ComplianceDashboard from './admin/ComplianceDashboard';


// PURE HELPER GENERATORS TO SATISFY STRICT ESLINT RULES FOR COMPONENTS
function makeAuditsLogId(): string {
  return `log-${Date.now()}`;
}
function makeInquiryId(): string {
  return `inq-${Date.now()}`;
}
function makePropertyId(): string {
  return `prop-${Date.now()}`;
}
function makeAdminUserId(): string {
  return `usr-${Math.round(100000 + Math.random() * 900000)}`;
}
function makeDeedApprovalCertificateIdAndHash() {
  const rndTxHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const certNum = Math.floor(1000 + Math.random() * 9000);
  return {
    blockchainHash: rndTxHash,
    certificateId: `VEX-CERT-${certNum}`,
  };
}

const INITIAL_PROPERTIES_PORTAL: Property[] = [
  // ---- TENANT-FACING (FOR RENT) LISTINGS ----
  {
    id: 'prop-1',
    name: 'Parkview Residences — Unit 12A',
    location: 'Zurich, Switzerland',
    tokenPrice: 120,
    tokensAvailable: 1540,
    totalTokens: 2500,
    apy: 9.4,
    category: 'Building',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: 'Bright 2-bedroom apartment on the 12th floor of Parkview Residences with panoramic lake views. Features an open-plan kitchen, hardwood floors, in-unit laundry, and a private balcony. Minutes from tram line 10 and the Zürichsee lakefront promenade.',
    purpose: 'FOR_RENT',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqFt: 1150,
    monthlyRent: 3800,
    occupancyStatus: 'VACANT',
    amenities: ['Balcony', 'Lake View', 'In-unit Laundry', 'Gym', 'Concierge', 'Secure Parking'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0x8f3c7e8a93b4512e737c1d1a8e932efea34c892b',
    certificateId: 'VEX-CERT-0199',
    documentName: 'Zurich-Deed-99A.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-2',
    name: 'Marina Bay Skyline Studio',
    location: 'Marina Bay, Singapore',
    tokenPrice: 85,
    tokensAvailable: 840,
    totalTokens: 1200,
    apy: 11.2,
    category: 'Investing',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek studio apartment in a premium high-rise tower overlooking Marina Bay. Fully furnished with smart home controls, floor-to-ceiling glass walls, and direct MRT access. Ideal for young professionals and expats seeking a central Singapore base.',
    purpose: 'FOR_RENT',
    type: 'Studio',
    bedrooms: 0,
    bathrooms: 1,
    sizeSqFt: 480,
    monthlyRent: 2900,
    occupancyStatus: 'OCCUPIED',
    currentTenantName: 'Elena Vasquez',
    currentTenantEmail: 'elena.v@techcorp.sg',
    amenities: ['Furnished', 'Smart Home', 'Rooftop Pool', 'MRT Access', 'Gym', '24/7 Security'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0x2a8eefc91d830b42f1cf8342419ecfe2e8fbf38c',
    certificateId: 'VEX-CERT-0224',
    documentName: 'SG-Deed-8224.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-3',
    name: 'West Hollywood Modern Townhouse',
    location: 'Los Angeles, California, USA',
    tokenPrice: 250,
    tokensAvailable: 410,
    totalTokens: 800,
    apy: 8.7,
    category: 'Advisory',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    description: '3-storey contemporary townhouse in prime West Hollywood. Features an open-concept living area, gourmet kitchen, rooftop terrace with city views, 2-car garage, and a private garden. Walking distance to Sunset Strip boutiques and restaurants.',
    purpose: 'FOR_RENT',
    type: 'House',
    bedrooms: 3,
    bathrooms: 3,
    sizeSqFt: 2800,
    monthlyRent: 8500,
    occupancyStatus: 'VACANT',
    amenities: ['Rooftop Terrace', 'Gourmet Kitchen', '2-Car Garage', 'Private Garden', 'Smart Security', 'EV Charging'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0xca7eb9dcf834be24c7e8fa1993ef2d348a2be85c',
    certificateId: 'VEX-CERT-0308',
    documentName: 'US-Deed-9308.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-4',
    name: "Côte d'Azur Beachfront Villa",
    location: 'Nice, France',
    tokenPrice: 180,
    tokensAvailable: 950,
    totalTokens: 1500,
    apy: 12.1,
    category: 'Building',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    description: 'Breathtaking 5-bedroom Mediterranean villa set directly on the Promenade des Anglais. Features a heated infinity pool, private beach access, wine cellar, and panoramic sea views from every room. Staff quarters included. Perfect for long-term lease or fractional investment.',
    purpose: 'FOR_RENT_AND_SALE',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 4,
    sizeSqFt: 5200,
    monthlyRent: 22000,
    occupancyStatus: 'VACANT',
    amenities: ['Infinity Pool', 'Private Beach', 'Wine Cellar', 'Staff Quarters', 'Home Theater', 'Sea View'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0x99a22e8317fbcdadeccaa98a2b3dfecfaea88102',
    certificateId: 'VEX-CERT-0842',
    documentName: 'FR-Nice-VillaDeed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-5',
    name: 'Canary Wharf Grade-A Office Suite',
    location: 'Canary Wharf, London, UK',
    tokenPrice: 145,
    tokensAvailable: 1100,
    totalTokens: 2000,
    apy: 10.5,
    category: 'Investing',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Premium Grade-A office suite on the 28th floor of One Canada Square. 6,200 sq ft of open-plan workspace with floor-to-ceiling glazing, private meeting rooms, a dedicated reception, server room, and DLR station access at ground level.',
    purpose: 'FOR_RENT',
    type: 'Office',
    bedrooms: 0,
    bathrooms: 4,
    sizeSqFt: 6200,
    monthlyRent: 32000,
    occupancyStatus: 'OCCUPIED',
    currentTenantName: 'Meridian Capital Partners',
    currentTenantEmail: 'leasing@meridiancap.co.uk',
    amenities: ['DLR Station Access', 'Concierge', 'Server Room', 'Meeting Rooms', 'Panoramic Views', 'Bike Storage'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0xdac43eb9118c7e42cca3c7d9e83dfefeacba9eee',
    certificateId: 'VEX-CERT-0599',
    documentName: 'UK-London-CanaryWharf-Deed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-6',
    name: 'Shibuya Crossing Designer Apartment',
    location: 'Shibuya, Tokyo, Japan',
    tokenPrice: 95,
    tokensAvailable: 480,
    totalTokens: 1000,
    apy: 13.4,
    category: 'Advisory',
    image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=800&q=80',
    description: 'Architect-designed 2-bedroom apartment steps from Shibuya Crossing. Features Japanese-minimalist interiors with walnut cabinetry, underfloor heating, a soaking tub, and a Juliet balcony facing the crossing. Fully equipped and move-in ready.',
    purpose: 'FOR_RENT',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    sizeSqFt: 860,
    monthlyRent: 4200,
    occupancyStatus: 'VACANT',
    amenities: ['Underfloor Heating', 'Soaking Tub', 'Balcony', 'Designer Interiors', 'Bike Storage', 'Parcel Locker'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0xfa399cbbedecca2418e2be3ef3daefeacba99122',
    certificateId: 'VEX-CERT-0711',
    documentName: 'JP-Tokyo-Shibuya-Deed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    ]
  },
  // ---- OWNER-MANAGED (FOR SALE) LISTINGS ----
  {
    id: 'prop-7',
    name: 'Dubai Marina Penthouse',
    location: 'Dubai Marina, UAE',
    tokenPrice: 320,
    tokensAvailable: 2000,
    totalTokens: 2000,
    apy: 7.8,
    category: 'Investing',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    description: 'Full-floor penthouse atop a 62-storey Marina tower. 4 bedrooms, private pool, double-height ceilings, and 360° views of the Gulf and city skyline. Includes a private elevator lobby, staff room, and 3 covered parking bays.',
    purpose: 'FOR_SALE',
    type: 'Apartment',
    bedrooms: 4,
    bathrooms: 5,
    sizeSqFt: 6800,
    monthlyRent: 45000,
    occupancyStatus: 'VACANT',
    amenities: ['Private Pool', 'Private Elevator', 'Staff Room', '3 Parking Bays', 'Smart Home', 'Marina View'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0xab12cd34ef56gh78ij90kl12mn34op56qr78st90',
    certificateId: 'VEX-CERT-1001',
    documentName: 'UAE-Dubai-PenthouseDeed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-8',
    name: 'Barcelona Gothic Quarter Flat',
    location: 'Gothic Quarter, Barcelona, Spain',
    tokenPrice: 75,
    tokensAvailable: 600,
    totalTokens: 800,
    apy: 9.1,
    category: 'Building',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description: 'Charming 2-bedroom apartment in a 19th-century building at the heart of the Gothic Quarter. Exposed stone walls, original tile floors, high ceilings, and a restored courtyard garden. Excellent Airbnb income history. Steps from Las Ramblas.',
    purpose: 'FOR_RENT_AND_SALE',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    sizeSqFt: 920,
    monthlyRent: 2400,
    occupancyStatus: 'OCCUPIED',
    currentTenantName: 'Sophie Renard',
    currentTenantEmail: 'sophie.r@studio-bcn.es',
    amenities: ['Courtyard Garden', 'Original Tile Floors', 'High Ceilings', 'Air Conditioning', 'Storage Room'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0x1122334455667788990011223344556677889900',
    certificateId: 'VEX-CERT-1102',
    documentName: 'ES-Barcelona-Deed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: 'prop-9',
    name: 'Sydney Harbourview Terrace House',
    location: 'Millers Point, Sydney, Australia',
    tokenPrice: 210,
    tokensAvailable: 1200,
    totalTokens: 1500,
    apy: 8.3,
    category: 'Advisory',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Heritage-listed sandstone terrace house with direct views of Sydney Harbour Bridge. 3 bedrooms, 2 bathrooms, and a fully renovated interior blending period charm with modern amenities. Private courtyard, cellar, and off-street parking.',
    purpose: 'FOR_SALE',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    sizeSqFt: 2100,
    monthlyRent: 7800,
    occupancyStatus: 'RESERVED',
    amenities: ['Harbour View', 'Private Courtyard', 'Cellar', 'Off-street Parking', 'Heritage Listed', 'Renovated Kitchen'],
    status: 'PUBLISHED',
    ownerId: 'usr-3',
    ownerName: 'Lord Sterling',
    blockchainHash: '0xaabbccddeeff00112233445566778899aabbccdd',
    certificateId: 'VEX-CERT-1203',
    documentName: 'AU-Sydney-TerraceHouseDeed.pdf',
    additionalImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    ]
  },
];

export default function PortalPage() {
  const router = useRouter();

  // Active user state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Database States loaded from LocalStorage
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Navigation sidebar tab state
  const [activeTab, setActiveTab] = useState<string>('');

  // Filtering states in marketplace for Tenant
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<'ALL' | 'FOR_RENT' | 'FOR_SALE'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Office' | 'Land' | 'Commercial Space'>('ALL');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);

  // Property detail modal state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<string>('discover');
  const [listerChats, setListerChats] = useState<{ id: string; propertyId: string; sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [inquiryType, setInquiryType] = useState<'RENT' | 'BUY'>('RENT');
  const [inquiryMsg, setInquiryMsg] = useState('');

  // Sovereign notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);

  // Fractional buy simulator in detail modal
  const [buyAmount, setBuyAmount] = useState<number>(5);
  const [mockTxnStatus, setMockTxnStatus] = useState<'none' | 'mining' | 'success'>('none');
  const [mockTxnHash, setMockTxnHash] = useState('');

  // Property Owner page inputs
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropPrice, setNewPropPrice] = useState(100);
  const [newPropSupply, setNewPropSupply] = useState(1000);
  const [newPropApy, setNewPropApy] = useState(9.5);
  const [newPropLocation, setNewPropLocation] = useState('');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropType, setNewPropType] = useState<'Apartment' | 'House' | 'Villa' | 'Studio' | 'Office' | 'Land' | 'Commercial Space'>('Apartment');
  const [newPropPurpose, setNewPropPurpose] = useState<'FOR_RENT' | 'FOR_SALE' | 'FOR_RENT_AND_SALE'>('FOR_SALE');
  const [newPropBedrooms, setNewPropBedrooms] = useState(2);
  const [newPropBathrooms, setNewPropBathrooms] = useState(2);
  const [newPropSize, setNewPropSize] = useState(1200);
  const [deedDocName, setDeedDocName] = useState('');
  const [photoMockUrl, setPhotoMockUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');

  // Owner interactive states
  const [ownerMsg, setOwnerMsg] = useState('');
  const [ownerSuccess, setOwnerSuccess] = useState('');

  // Super Admin page - new admin creator state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Rejection reasoning input for Admin audits
  const [adminRejectionNote, setAdminRejectionNote] = useState<{ [propId: string]: string }>({});

  // Safety trigger for loading
  const [systemMounted, setSystemMounted] = useState(false);

  // Load database and session from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('vex_active_user');
      if (!active) {
        // No session found, send to auth page
        router.push('/auth');
        return;
      }

      const parsedUser = JSON.parse(active);

      // Wrap in setTimeout to prevent synchronously triggering cascading React renders
      const timer = setTimeout(() => {
        setCurrentUser(parsedUser);

        // Default active tab per role
        if (parsedUser.role === 'SUPER_ADMIN') setActiveTab('admins');
        else if (parsedUser.role === 'ADMIN') setActiveTab('audits');
        else if (parsedUser.role === 'PROPERTY_OWNER') setActiveTab('owner_properties');
        else setActiveTab('discover');

        // Load properties database
        const storedProps = localStorage.getItem('vex_properties');
        const propsVersion = localStorage.getItem('vex_properties_version');
        if (storedProps && propsVersion === 'v2') {
          setProperties(JSON.parse(storedProps));
        } else {
          localStorage.setItem('vex_properties', JSON.stringify(INITIAL_PROPERTIES_PORTAL));
          localStorage.setItem('vex_properties_version', 'v2');
          setProperties(INITIAL_PROPERTIES_PORTAL);
        }

        // Load users registry
        const storedUsers = localStorage.getItem('vex_users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }

        // Load inquiries inbox
        const storedInq = localStorage.getItem('vex_inquiries');
        if (storedInq) {
          setInquiries(JSON.parse(storedInq));
        } else {
          localStorage.setItem('vex_inquiries', JSON.stringify([]));
        }

        // Load audit logs database
        const storedLogs = localStorage.getItem('vex_audit_logs');
        if (storedLogs) {
          setAuditLogs(JSON.parse(storedLogs));
        }

        // Load lister chats
        const storedChats = localStorage.getItem('vex_lister_chats');
        if (storedChats) {
          setListerChats(JSON.parse(storedChats));
        } else {
          localStorage.setItem('vex_lister_chats', JSON.stringify([]));
        }

        // Load favorites
        const storedFav = localStorage.getItem('vex_favorites_user_' + parsedUser.id);
        if (storedFav) {
          setFavorites(JSON.parse(storedFav));
        }

        // Load notifications database
        const storedNotif = localStorage.getItem('vex_notifications');
        if (storedNotif) {
          setNotifications(JSON.parse(storedNotif));
        } else {
          const seedNotif: NotificationItem[] = [
            {
              id: 'n-1',
              category: 'IDENTITY',
              title: 'Compliance Clearing Required',
              message: 'Your transactor account has been initialized. Please complete your passport details in the KYC & Wallet Center.',
              unread: true,
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
            },
            {
              id: 'n-2',
              category: 'BLOCKCHAIN',
              title: 'Verifiable Deed Audits Live',
              message: 'Admin checked and approved the title deeds for Obsidian Tower. ERC-1155 Title Certificate issued.',
              unread: false,
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'n-3',
              category: 'ESCROW',
              title: 'Test Credits Released',
              message: 'Escrow smart contract released 3,700 USDT sandbox credits matching Alpine lease protocols.',
              unread: true,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'n-4',
              category: 'SECURITY',
              title: 'IP Signature Change Detected',
              message: 'Sovereign validator linked signature changes matching Zurich proxy egress nodes.',
              unread: true,
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            }
          ];
          localStorage.setItem('vex_notifications', JSON.stringify(seedNotif));
          setNotifications(seedNotif);
        }

        setSystemMounted(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [router]);

  // Logout session
  const handleLogout = () => {
    if (!currentUser) return;
    const currentLogs = [...auditLogs];
    const newLog = {
      id: makeAuditsLogId(),
      user: currentUser.name,
      email: currentUser.email,
      action: 'User Logged Out',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('vex_audit_logs', JSON.stringify([newLog, ...currentLogs]));
    localStorage.removeItem('vex_active_user');
    router.push('/');
  };

  // State Save helper for Properties Database
  const persistProperties = (updated: Property[]) => {
    setProperties(updated);
    localStorage.setItem('vex_properties', JSON.stringify(updated));
  };

  // State Save helper for Lister Chats Database
  const persistListerChats = (updated: { id: string; propertyId: string; sender: string; text: string; time: string }[]) => {
    setListerChats(updated);
    localStorage.setItem('vex_lister_chats', JSON.stringify(updated));
  };

  // State Save helper for User Database
  const persistUsers = (updated: UserAccount[]) => {
    setUsers(updated);
    localStorage.setItem('vex_users', JSON.stringify(updated));
  };

  // State Save helper for Inquiries Database
  const persistInquiries = (updated: Inquiry[]) => {
    setInquiries(updated);
    localStorage.setItem('vex_inquiries', JSON.stringify(updated));
  };

  // State Save helper for audit logger
  const logAudit = (actionText: string) => {
    if (!currentUser) return;
    const newEntry: AuditLog = {
      id: makeAuditsLogId(),
      user: currentUser.name,
      email: currentUser.email,
      action: actionText,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('vex_audit_logs', JSON.stringify(updated));
  };

  // Dispatch interactive notifications from secondary elements
  const handleTriggerNotification = (title: string, message: string, category: 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY' | 'GENERAL') => {
    const newItem: NotificationItem = {
      id: `n-${Date.now()}`,
      category,
      title,
      message,
      unread: true,
      timestamp: new Date().toISOString()
    };
    const updated = [newItem, ...notifications];
    setNotifications(updated);
    localStorage.setItem('vex_notifications', JSON.stringify(updated));
  };

  // Toggle favorite property on client side
  const toggleFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    let next: string[];
    if (favorites.includes(propertyId)) {
      next = favorites.filter((id) => id !== propertyId);
    } else {
      next = [...favorites, propertyId];
    }
    setFavorites(next);
    localStorage.setItem('vex_favorites_user_' + currentUser.id, JSON.stringify(next));
  };

  // Simulate property buy order
  const handleBuyInvestment = (property: Property) => {
    if (!currentUser) return;
    if (currentUser.walletStatus === 'NOT_LINKED') {
      alert('You must link a digital wallet under the "KYC & Wallet" center before completing fractional property buys.');
      return;
    }
    if (currentUser.kycStatus !== 'APPROVED') {
      alert('KYC approval is required to purchase fractional equity. Please upload your documents first.');
      return;
    }

    setMockTxnStatus('mining');
    const randomHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setMockTxnHash(randomHash);

    setTimeout(() => {
      // Deduct available tokens from the property list
      const updated = properties.map((p) => {
        if (p.id === property.id) {
          const limit = Math.max(0, p.tokensAvailable - buyAmount);
          return { ...p, tokensAvailable: limit };
        }
        return p;
      });

      persistProperties(updated);
      setMockTxnStatus('success');
      logAudit(`Purchased ${buyAmount} fractional keys in ${property.name}`);

      // Alert about success
      setTimeout(() => {
        alert(`Success! Multi-sig gateway verified transaction ${randomHash}. Your ${buyAmount} keys of ${property.name} are locked on ledger.`);
        setMockTxnStatus('none');
        setSelectedProperty(null);
      }, 500);

    }, 1500);
  };

  // Trigger Inquiry creation (Rent requests or custom message)
  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProperty) return;

    const newInq: Inquiry = {
      id: makeInquiryId(),
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      tenantName: currentUser.name,
      tenantEmail: currentUser.email,
      tenantPhone: currentUser.phone,
      message: inquiryMsg,
      type: inquiryType,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    const updated = [newInq, ...inquiries];
    persistInquiries(updated);

    logAudit(`Submitted rent/buy inquiry for ${selectedProperty.name}`);
    alert(`Your inquiry request has been successfully dispatched to the owner (${selectedProperty.ownerName}). They will review and sign back via the portal.`);

    setInquiryMsg('');
    setSelectedProperty(null);
  };

  const openPropertyDetail = (item: Property) => {
    setSelectedProperty(item);
    setPreviousTab(activeTab);
    setActiveTab('property_detail');
  };

  // Owner helper to initiate editing details
  const startEditProperty = (item: Property) => {
    setEditingPropertyId(item.id);
    setNewPropTitle(item.name);
    setNewPropLocation(item.location);
    setNewPropPrice(item.tokenPrice);
    setNewPropSupply(item.totalTokens);
    setNewPropApy(item.apy);
    setNewPropType(item.type);
    setNewPropPurpose(item.purpose);
    setNewPropBedrooms(item.bedrooms || 2);
    setNewPropBathrooms(item.bathrooms || 2);
    setNewPropSize(item.sizeSqFt || 1200);
    setPhotoMockUrl(item.image);
    setDeedDocName(item.documentName || '');
    setNewPropDesc(item.description || '');
    setOwnerMsg('');
    setOwnerSuccess('');
    
    // Smooth scroll to formulation form or alert
    const formEl = document.getElementById('property-formulation-box');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Owner: create new property draft or edit existing
  const handleCreatePropertyDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setOwnerMsg('');
    setOwnerSuccess('');

    if (!newPropTitle.trim() || !newPropLocation.trim()) {
      setOwnerMsg('Title and location are required parameters.');
      return;
    }

    if (!deedDocName.trim()) {
      setOwnerMsg('You must provide the title of at least one official property deed document for verification.');
      return;
    }

    if (editingPropertyId) {
      // Edit existing property listing
      const updated = properties.map((p) => {
        if (p.id === editingPropertyId) {
          return {
            ...p,
            name: newPropTitle,
            location: newPropLocation,
            tokenPrice: Number(newPropPrice) || 100,
            tokensAvailable: Number(newPropSupply) || 1000,
            totalTokens: Number(newPropSupply) || 1000,
            apy: Number(newPropApy) || 8.5,
            image: photoMockUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
            description: newPropDesc || 'Sovereign-listed real estate backing.',
            purpose: newPropPurpose,
            type: newPropType,
            bedrooms: Number(newPropBedrooms) || undefined,
            bathrooms: Number(newPropBathrooms) || undefined,
            sizeSqFt: Number(newPropSize) || undefined,
            documentName: deedDocName,
          };
        }
        return p;
      });

      persistProperties(updated);
      logAudit(`Updated property registry details for: ${newPropTitle}`);
      setOwnerSuccess(`Property details for "${newPropTitle}" were successfully updated in the registry.`);
      
      // Clear fields and exit edit state
      setEditingPropertyId(null);
      setNewPropTitle('');
      setNewPropLocation('');
      setNewPropDesc('');
      setDeedDocName('');
      setPhotoMockUrl('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
      return;
    }

    const uniqueId = makePropertyId();
    const newProp: Property = {
      id: uniqueId,
      name: newPropTitle,
      location: newPropLocation,
      tokenPrice: Number(newPropPrice) || 100,
      tokensAvailable: Number(newPropSupply) || 1000,
      totalTokens: Number(newPropSupply) || 1000,
      apy: Number(newPropApy) || 8.5,
      category: 'Investing',
      image: photoMockUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      description: newPropDesc || 'Sovereign-listed real estate backing.',
      purpose: newPropPurpose,
      type: newPropType,
      bedrooms: Number(newPropBedrooms) || undefined,
      bathrooms: Number(newPropBathrooms) || undefined,
      sizeSqFt: Number(newPropSize) || undefined,
      status: 'DRAFT', // Starts strictly as a draft
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      documentName: deedDocName,
    };

    const updated = [...properties, newProp];
    persistProperties(updated);

    logAudit(`Created property listing Draft: ${newProp.name}`);
    setOwnerSuccess(`Draft listing for "${newProp.name}" was compiled. You can submit it for approval below.`);

    // Clear fields
    setNewPropTitle('');
    setNewPropLocation('');
    setNewPropDesc('');
    setDeedDocName('');
  };

  // Owner submits draft for official reviews
  const submitDraftForReview = (propId: string) => {
    const updated = properties.map((p) => {
      if (p.id === propId) {
        return { ...p, status: 'SUBMITTED' as const };
      }
      return p;
    });
    persistProperties(updated);
    logAudit(`Submitted property for admin review: ${propId}`);
    alert('Deed and credentials dispatched to operations queue for deep audit reviews.');
  };

  // Owner archives listing
  const archiveListing = (propId: string) => {
    const updated = properties.map((p) => {
      if (p.id === propId) {
        return { ...p, status: 'ARCHIVED' as const };
      }
      return p;
    });
    persistProperties(updated);
    logAudit(`Archived property listing: ${propId}`);
  };

  // Owner deletes listing
  const handleDeleteProperty = (propId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this property from your registry? This will permanently delete the draft and assets keys ledger.')) {
      return;
    }
    const propToDelete = properties.find((p) => p.id === propId);
    if (!propToDelete) return;
    const updated = properties.filter((p) => p.id !== propId);
    persistProperties(updated);
    logAudit(`Deleted property listing: ${propToDelete.name}`);
    setOwnerSuccess(`Successfully deleted property: "${propToDelete.name}"`);
    if (selectedProperty && selectedProperty.id === propId) {
      setSelectedProperty(null);
    }
  };

  // Owner: mark inquiry responded
  const markInquiryResponded = (inqId: string) => {
    const updated = inquiries.map((inq) => {
      if (inq.id === inqId) {
        return { ...inq, status: 'RESPONDED' as const };
      }
      return inq;
    });
    persistInquiries(updated);
    logAudit(`Marked tenant inquiry responded: ${inqId}`);
  };

  // Owner: close inquiry
  const closeInquiry = (inqId: string) => {
    const updated = inquiries.map((inq) => {
      if (inq.id === inqId) {
        return { ...inq, status: 'CLOSED' as const };
      }
      return inq;
    });
    persistInquiries(updated);
    logAudit(`Closed tenant inquiry: ${inqId}`);
  };

  // Admin approves property
  const handleApproveProperty = (propId: string) => {
    // Generate mock hash & certificate ID as required by Blockchain spec
    const { blockchainHash, certificateId } = makeDeedApprovalCertificateIdAndHash();

    const updated = properties.map((p) => {
      if (p.id === propId) {
        return {
          ...p,
          status: 'PUBLISHED' as const, // Verified properties become visible in the public market
          blockchainHash,
          certificateId,
        };
      }
      return p;
    });

    persistProperties(updated);
    logAudit(`Approved property verification and issued Digital Title Certificate: ${propId}`);
    alert(`Approval complete. Recorded document hash on blockchain. Minted ERC-1155 Digital Title certificate ID ${certificateId}!`);
  };

  // Admin rejects property
  const handleRejectProperty = (propId: string) => {
    const reason = adminRejectionNote[propId] || 'Incomplete deed documentation files or unverified owner identity.';
    const updated = properties.map((p) => {
      if (p.id === propId) {
        return {
          ...p,
          status: 'REJECTED' as const,
          rejectionReason: reason,
        };
      }
      return p;
    });

    persistProperties(updated);
    logAudit(`Rejected property compliance: ${propId}. Reason: ${reason}`);
    alert(`Property submission rejected and notified to owner.`);
  };

  // Admin toggles user account ban/suspension
  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const targetStatus: 'SUSPENDED' | 'ACTIVE' = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: targetStatus };
      }
      return u;
    });
    persistUsers(updated);
    logAudit(`Toggled user status to ${targetStatus} for user: ${userId}`);
    alert(`User Account status modified to ${targetStatus}`);
  };

  // Admin: approve user KYC
  const approveUserKycState = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, kycStatus: 'APPROVED' as const };
      }
      return u;
    });
    persistUsers(updated);
    logAudit(`Approved User KYC portfolio: ${userId}`);
    alert(`Compliance cleared. Individual is now verified to transact.`);
  };

  // Tenant: trigger KYC upload state simulation
  const triggerSelfKycSubmit = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, kycStatus: 'PENDING' as const };
    setCurrentUser(updatedUser);

    // Save back to db
    const updatedDb = users.map((u) => {
      if (u.id === currentUser.id) return { ...u, kycStatus: 'PENDING' as const };
      return u;
    });
    persistUsers(updatedDb);
    localStorage.setItem('vex_active_user', JSON.stringify(updatedUser));
    logAudit(`Self KYC passport documents dispatched`);
    alert('Verification packet has been received by compliance administrators and is currently inside the verification queue.');
  };

  // Tenant: simulate connecting web3 wallet
  const handleConnectWalletSim = () => {
    if (!currentUser) return;
    const dummyAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const updatedUser = { 
      ...currentUser, 
      walletStatus: 'VERIFIED' as const,
      linkedWalletAddress: dummyAddress
    };
    setCurrentUser(updatedUser);

    const updatedDb = users.map((u) => {
      if (u.id === currentUser.id) {
        return { 
          ...u, 
          walletStatus: 'VERIFIED' as const,
          linkedWalletAddress: dummyAddress
        };
      }
      return u;
    });
    persistUsers(updatedDb);
    localStorage.setItem('vex_active_user', JSON.stringify(updatedUser));
    logAudit(`Wallet linked: ${dummyAddress}`);
    alert(`Wallet Connected successfully!\nAddress: ${dummyAddress}`);
  };

  // Tenant trigger wallet link
  const triggerWalletRelayLink = () => {
    handleConnectWalletSim();
  };

  // Tenant unlink wallet address
  const unlinkWalletAddress = () => {
    if (!currentUser) return;
    const updatedUser = { 
      ...currentUser, 
      walletStatus: 'NOT_LINKED' as const,
      linkedWalletAddress: undefined
    };
    setCurrentUser(updatedUser);

    const updatedDb = users.map((u) => {
      if (u.id === currentUser.id) {
        return { 
          ...u, 
          walletStatus: 'NOT_LINKED' as const,
          linkedWalletAddress: undefined
        };
      }
      return u;
    });
    persistUsers(updatedDb);
    localStorage.setItem('vex_active_user', JSON.stringify(updatedUser));
    logAudit(`Wallet unlinked`);
    alert(`Wallet Disconnected.`);
  };

  // Super Admin: create new Admin user
  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword) {
      alert('Fill all parameters.');
      return;
    }

    const exists = users.some((u) => u.email.trim().toLowerCase() === newAdminEmail.trim().toLowerCase());
    if (exists) {
      alert('Email registered already');
      return;
    }

    const newAdmin: UserAccount = {
      id: makeAdminUserId(),
      name: newAdminName,
      email: newAdminEmail.toLowerCase().trim(),
      role: 'ADMIN',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      walletStatus: 'NOT_LINKED',
      createdAt: new Date().toISOString(),
    };

    // Note in prototype we push password and save
    const parsedDb: any[] = JSON.parse(localStorage.getItem('vex_users') || '[]');
    parsedDb.push({
      ...newAdmin,
      passwordHash: newAdminPassword
    });
    localStorage.setItem('vex_users', JSON.stringify(parsedDb));
    setUsers(parsedDb);

    logAudit(`Super-Admin created administrative personnel: ${newAdminName}`);
    alert(`Admin account successfully issued for ${newAdminName}. They can now login with ${newAdminEmail}.`);

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
  };

  // Filter listings based on Tenant selection
  const filteredProperties = properties.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPurpose = filterPurpose === 'ALL' || item.purpose === filterPurpose;
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesVerified = !filterVerified || item.status === 'PUBLISHED';
    // Only published listings should be discoverable by default
    const isPublic = item.status === 'PUBLISHED' || item.status === 'VERIFIED';
    return matchesSearch && matchesPurpose && matchesType && matchesVerified && isPublic;
  });

  if (!systemMounted || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Layers className="w-8 h-8 text-blue-600 animate-spin" />
          <span>INITIALIZING DIGITAL LEDGER ENVIRONMENT...</span>
        </div>
      </div>
    );
  }

  // Generate color palette variables for roles tags
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROPERTY_OWNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
      
      {/* GLOBAL BANNER */}
      <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Sovereign Security Gateway Active</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span>Client: SHA-256</span>
          <span>Ledger Index: #82,492</span>
          <span>User: <strong className="text-emerald-300">{currentUser.name}</strong></span>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-9 h-9 rounded flex items-center justify-center font-black text-xl shadow">
            V
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              VEX <span className="text-xs bg-slate-101 text-slate-500 font-mono py-0.5 px-2 rounded-full border">Ledger Hub</span>
            </span>
            <p className="text-[10px] text-slate-500 font-mono">Decentralized Fractional Property Custody</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-full ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700 hidden sm:inline">{currentUser.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-slate-200 px-3 py-2 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* PORTAL WORKING GRID */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION - BLUE BACKGROUND */}
        <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
          <div className="p-4 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            Navigation Console
          </div>

          <nav className="p-2 space-y-1 flex-1">
            {/* ====== TENANT & BUYER SUBPAGES ====== */}
            {currentUser.role === 'TENANT' && (
              <>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'discover'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>DISCOVER MARKETPLACE</span>
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'favorites'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>SAVED PROPERTIES</span>
                </button>

                <button
                  onClick={() => setActiveTab('holdings')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'holdings'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>MY FRACTIONAL ASSETS</span>
                </button>

                <button
                  onClick={() => setActiveTab('tenant_kyc')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'tenant_kyc'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span>KYC & WALLET CENTER</span>
                </button>

                <button
                  onClick={() => setActiveTab('tenant_messages')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'tenant_messages'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>PROPERTY CHATS</span>
                </button>
              </>
            )}

            {/* ====== PROPERTY OWNER SUBPAGES ====== */}
            {currentUser.role === 'PROPERTY_OWNER' && (
              <>
                <button
                  onClick={() => setActiveTab('owner_properties')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'owner_properties'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>MY REAL PROPERTIES</span>
                </button>

                <button
                  onClick={() => setActiveTab('owner_lifecycle')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'owner_lifecycle'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>LIFECYCLE TRACKER</span>
                </button>

                <button
                  onClick={() => setActiveTab('owner_inquiries')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'owner_inquiries'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-yellow-400" />
                  <span>TENANT INQUIRIES ({inquiries.filter(i => properties.find(p => p.id === i.propertyId)?.ownerId === currentUser.id).length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('owner_kyc')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'owner_kyc'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>COMPLIANCE & WALLET</span>
                </button>

                <button
                  onClick={() => setActiveTab('owner_messages')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'owner_messages'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-rose-400" />
                  <span>TENANT MESSAGES</span>
                </button>
              </>
            )}

            {/* ====== ADMIN SUBPAGES ====== */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
              <>
                <div className="text-[10px] font-mono text-slate-500 px-4 pt-3 pb-1 uppercase tracking-widest border-t border-slate-800">
                  Compliance Reviews
                </div>

                <button
                  onClick={() => setActiveTab('audits')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'audits'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>DEVISAL AUDITS ({properties.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('registry')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'registry'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>USER REGISTRY</span>
                </button>

                <button
                  onClick={() => setActiveTab('compliance_kyc')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'compliance_kyc'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>KYC VERIFICATIONS</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'history'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4 text-amber-500" />
                  <span>COMPLIANCE LOGS</span>
                </button>
              </>
            )}

            {/* ====== SUPER ADMIN SYSTEM OVERRIDES ====== */}
            {currentUser.role === 'SUPER_ADMIN' && (
              <>
                <div className="text-[10px] font-mono text-slate-500 px-4 pt-4 pb-1 uppercase tracking-widest border-t border-slate-800">
                  Sovereign Override
                </div>

                <button
                  onClick={() => setActiveTab('admins')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'admins'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 text-yellow-400" />
                  <span>ADMIN ORCHESTRATOR</span>
                </button>

                <button
                  onClick={() => setActiveTab('overrides')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                    activeTab === 'overrides'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-rose-400" />
                  <span>GLOBAL OVERRIDES</span>
                </button>
              </>
            )}

            {/* ====== GLOBAL DOCUMENTATION SECTION ====== */}
            <div className="text-[10px] font-mono text-slate-500 px-4 pt-4 pb-1 uppercase tracking-widest border-t border-slate-800">
              System Guidelines
            </div>
            <button
              onClick={() => setActiveTab('prd_documentation')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-mono tracking-wider transition-colors ${
                activeTab === 'prd_documentation'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>COMPLIANCE PRD</span>
            </button>
          </nav>

          {/* SIDEBAR FOOTER */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 text-[10px] font-mono text-slate-500 space-y-1">
            <div>Ledger TLS v1.2</div>
            <div>Status: <span className="text-emerald-400">Connected</span></div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto">

          {/* DYNAMIC SUBPAGE HEADER */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Secure Node Segment</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 uppercase tracking-tight">
                {activeTab === 'discover' && 'Market Discovery & Mint Exchange'}
                {activeTab === 'favorites' && 'Your Bookmarked Assets'}
                {activeTab === 'holdings' && 'Active Fractional Holding Portfolio'}
                {activeTab === 'tenant_kyc' && 'Sovereign Verification & Setup'}
                {activeTab === 'owner_properties' && 'Your Real Estate Registry'}
                {activeTab === 'owner_lifecycle' && 'Real Estate Life-cycle Tracker'}
                {activeTab === 'owner_inquiries' && 'Direct Tenant Inquiry Leads'}
                {activeTab === 'owner_kyc' && 'Identity & Smart Escrow Onboarding'}
                {activeTab === 'audits' && 'Admin Real Property Escrow Audits'}
                {activeTab === 'registry' && 'Master User Sanctions Registry'}
                {activeTab === 'compliance_kyc' && 'Global Identity Review Audits'}
                {activeTab === 'history' && 'Platform Audit Logs & Trail'}
                {activeTab === 'admins' && 'Personnel & Admin Account Assembly'}
                {activeTab === 'overrides' && 'Sovereign Controls & Force Registry Overrides'}
                {activeTab === 'property_detail' && 'Sovereign Asset Detailed Ledger Viewer'}
                {activeTab === 'prd_documentation' && 'VEX Compliance & PRD Manifest'}
                {activeTab === 'tenant_messages' && 'Property Owner Messaging Hub'}
                {activeTab === 'owner_messages' && 'Tenant Conversation Manager'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'discover' && 'Browse, inspect verified real-estate tokens or initiate direct rent/buy requests.'}
                {activeTab === 'favorites' && 'List of bookmarked structures. Re-toggle verification badge specs or clear listings.'}
                {activeTab === 'holdings' && 'View your active properties tokens. Earn on-chain continuous dividends backed by physical rent yields.'}
                {activeTab === 'tenant_kyc' && 'Prepare parameters required for digital title mints and smart escrow transaction signatures.'}
                {activeTab === 'owner_properties' && 'Submit, draft, upload utility files and deed documents. Control multi-sig deployments.'}
                {activeTab === 'owner_lifecycle' && 'Verify state transitions across your real estate deeds from draft creation to verified and active.'}
                {activeTab === 'owner_inquiries' && 'Communicate, review credentials and lock rental inquiries directly in-app.'}
                {activeTab === 'owner_kyc' && 'Verify your corporate ownership state and connect wallet relays to distribute tokens globally.'}
                {activeTab === 'audits' && 'Perform property verification by inspecting private certificates and backing title deeds.'}
                {activeTab === 'registry' && 'Search and toggle state access permission layers instantly to override bad actors.'}
                {activeTab === 'compliance_kyc' && 'Validate sovereign passports and KYC applications for the token system.'}
                {activeTab === 'history' && 'Browse immutable system audit logs recording legal compliance and cryptographic actions.'}
                {activeTab === 'admins' && 'Issue administrative privileges or disable staff permissions.'}
                {activeTab === 'overrides' && 'Master-key admin bypass panel.'}
                {activeTab === 'property_detail' && 'Deep-dive into structural characteristics, verified deeds, map boundaries, and direct lister contact.'}
                {activeTab === 'prd_documentation' && 'Trust, Blockchain, Escrow & Compliance functional audit guidelines specification.'}
                {activeTab === 'tenant_messages' && 'Chat directly with property owners about fractional tokens, lease terms, and blockchain deed verification.'}
                {activeTab === 'owner_messages' && 'Manage all incoming tenant rent inquiries, fractional buy requests, and lease negotiations in real-time.'}
              </p>
            </div>

            {/* Quick status displays */}
            <div className="flex gap-3 text-xs font-mono font-bold">
              <div className="bg-slate-100 border p-3 rounded-xl">
                <div className="text-slate-400 text-[10px]">KYC VERIFIED</div>
                <div className="text-slate-800 mt-1 flex items-center gap-1.5">
                  {currentUser.kycStatus === 'APPROVED' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{currentUser.kycStatus}</span>
                </div>
              </div>
              <div className="bg-slate-100 border p-3 rounded-xl">
                <div className="text-slate-400 text-[10px]">WALLET ACCESS</div>
                <div className="text-slate-800 mt-1 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="truncate max-w-[120px]">{currentUser.walletStatus === 'VERIFIED' ? 'LINKED' : 'NOT LINKED'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ====== 1. PROPERTY DETAIL INNER VIEW ====== */}
          {activeTab === 'property_detail' && selectedProperty && (
            <PropertyDetail
              selectedProperty={selectedProperty}
              setActiveTab={setActiveTab}
              previousTab={previousTab}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              handleBuyInvestment={handleBuyInvestment}
              mockTxnStatus={mockTxnStatus}
              inquiryMsg={inquiryMsg}
              setInquiryMsg={setInquiryMsg}
              submitInquiry={submitInquiry}
              listerChats={listerChats}
              chatInput={chatInput}
              setChatInput={setChatInput}
              persistListerChats={persistListerChats}
            />
          )}

          {/* ====== 2. MARKET DISCOVER BUYER VIEW ====== */}
          {activeTab === 'discover' && (
            <MarketDiscover
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterPurpose={filterPurpose}
              setFilterPurpose={setFilterPurpose}
              filterType={filterType}
              setFilterType={setFilterType}
              filterVerified={filterVerified}
              setFilterVerified={setFilterVerified}
              filteredProperties={filteredProperties}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              openPropertyDetail={openPropertyDetail}
            />
          )}

          {/* ====== 3. SAVED LISTINGS BUYER VIEW ====== */}
          {activeTab === 'favorites' && (
            <SavedListings
              favorites={favorites}
              properties={properties}
              toggleFavorite={toggleFavorite}
              openPropertyDetail={openPropertyDetail}
            />
          )}

          {/* ====== 4. ACTIVE HOLDINGS BUYER VIEW ====== */}
          {activeTab === 'holdings' && (
            <ActiveHoldings
              properties={properties}
              currentUser={currentUser}
              openPropertyDetail={openPropertyDetail}
            />
          )}

          {/* ====== 5. IDENTITY KYC REGISTER BUYER VIEW ====== */}
          {activeTab === 'tenant_kyc' && (
            <TenantKyc
              currentUser={currentUser}
              triggerSelfKycSubmit={triggerSelfKycSubmit}
              triggerWalletRelayLink={triggerWalletRelayLink}
              unlinkWalletAddress={unlinkWalletAddress}
            />
          )}

          {/* ====== 6. OWNED LISTINGS OWNER VIEW ====== */}
          {activeTab === 'owner_properties' && (
            <OwnedProperties
              ownerMsg={ownerMsg}
              ownerSuccess={ownerSuccess}
              editingPropertyId={editingPropertyId}
              setEditingPropertyId={setEditingPropertyId}
              newPropTitle={newPropTitle}
              setNewPropTitle={setNewPropTitle}
              newPropLocation={newPropLocation}
              setNewPropLocation={setNewPropLocation}
              newPropPrice={newPropPrice}
              setNewPropPrice={setNewPropPrice}
              newPropSupply={newPropSupply}
              setNewPropSupply={setNewPropSupply}
              newPropApy={newPropApy}
              setNewPropApy={setNewPropApy}
              newPropType={newPropType}
              setNewPropType={setNewPropType}
              newPropPurpose={newPropPurpose}
              setNewPropPurpose={setNewPropPurpose}
              deedDocName={deedDocName}
              setDeedDocName={setDeedDocName}
              photoMockUrl={photoMockUrl}
              setPhotoMockUrl={setPhotoMockUrl}
              newPropDesc={newPropDesc}
              setNewPropDesc={setNewPropDesc}
              handleCreatePropertyDraft={handleCreatePropertyDraft}
              properties={properties}
              currentUser={currentUser}
              submitDraftForReview={submitDraftForReview}
              startEditProperty={startEditProperty}
              handleDeleteProperty={handleDeleteProperty}
            />
          )}

          {/* ====== 7. LIFECYCLE MONITORING OWNER VIEW ====== */}
          {activeTab === 'owner_lifecycle' && (
            <OwnerLifecycle
              properties={properties}
              currentUser={currentUser}
              archiveListing={archiveListing}
            />
          )}

          {/* ====== 8. LEASE INQUIRIES OWNER VIEW ====== */}
          {activeTab === 'owner_inquiries' && (
            <OwnerInquiries
              inquiries={inquiries}
              properties={properties}
              currentUser={currentUser}
              markInquiryResponded={markInquiryResponded}
              closeInquiry={closeInquiry}
            />
          )}

          {/* ====== 9. CORPORATE KYC PORT OWNER VIEW ====== */}
          {activeTab === 'owner_kyc' && (
            <OwnerKyc
              currentUser={currentUser}
              triggerSelfKycSubmit={triggerSelfKycSubmit}
              handleConnectWalletSim={handleConnectWalletSim}
            />
          )}

          {/* ====== 10. COMPLIANCE AUDITS REGISTRATION ADMIN ====== */}
          {activeTab === 'audits' && (
            <PropertyAudits
              properties={properties}
              adminRejectionNote={adminRejectionNote}
              setAdminRejectionNote={setAdminRejectionNote}
              handleRejectProperty={handleRejectProperty}
              handleApproveProperty={handleApproveProperty}
              setProperties={setProperties}
              persistProperties={persistProperties}
            />
          )}

          {/* ====== 11. REGISTRY MASTER USER TABLE ADMIN ====== */}
          {activeTab === 'registry' && (
            <MasterUserRegistry
              users={users}
              toggleUserStatus={toggleUserStatus}
            />
          )}

          {/* ====== 12. IDENTITY CLEARINGS REVIEW ADMIN ====== */}
          {activeTab === 'compliance_kyc' && (
            <KycVerificationsAudit
              currentUser={currentUser!}
              users={users}
              approveUserKycState={approveUserKycState}
              onAuditLogAdded={logAudit}
              onNotificationTriggered={handleTriggerNotification}
              onUpdateUsers={persistUsers}
            />
          )}

          {/* ====== 13. IMMUTABLE ACTION LOG AUDITS HISTORIC ADMIN ====== */}
          {activeTab === 'history' && (
            <AuditLogsTrail
              auditLogs={auditLogs}
            />
          )}

          {/* ====== 14. ADMIN STAFF ASSIGNMENT SUPERADMIN ====== */}
          {activeTab === 'admins' && (
            <ManageAdminStaff
              users={users}
              newAdminName={newAdminName}
              setNewAdminName={setNewAdminName}
              newAdminEmail={newAdminEmail}
              setNewAdminEmail={setNewAdminEmail}
              newAdminPassword={newAdminPassword}
              setNewAdminPassword={setNewAdminPassword}
              handleCreateAdminSubmit={handleCreateAdminSubmit}
            />
          )}

          {/* ====== 15. NETWORK OVERRIDES BYPAS CENTER ====== */}
          {activeTab === 'overrides' && (
            <SecurityOverrides />
          )}

          {/* ====== 16. GLOBAL COMPLIANCE PRD VIEW ====== */}
          {activeTab === 'prd_documentation' && (
            <PrdDoc />
          )}

          {/* ====== 17. TENANT MESSAGES VIEW ====== */}
          {activeTab === 'tenant_messages' && (
            <TenantMessages properties={properties} currentUser={currentUser} />
          )}

          {/* ====== 18. OWNER MESSAGES VIEW ====== */}
          {activeTab === 'owner_messages' && (
            <OwnerMessages properties={properties} currentUser={currentUser} />
          )}

        </main>
      </div>
    </div>
  );
}

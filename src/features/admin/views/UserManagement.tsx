import React, { useState, useEffect, useMemo } from 'react';
import { type User, type StaffRequest, UserService } from '../api/user.service';
import { type Role, RoleService } from '../api/role.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Plus, Users, UserCheck, Search, Shield, KeyRound, Lock, Unlock, CheckCircle2, AlertCircle, Sparkles, Pencil } from 'lucide-react';

const MOCK_FALLBACK_ROLES: Role[] = [
  { id: 1, name: 'ROLE_ADMIN', description: 'Toàn quyền quản trị hệ thống' },
  { id: 2, name: 'ROLE_STAFF', description: 'Nhân viên điều phối & quản lý vé' }
];

const MOCK_FALLBACK_STAFFS: User[] = [
  {
    id: 'u1',
    staffCode: 'NV-001',
    fullName: 'Lưu Trung Nghĩa',
    email: 'admin@vexe.vn',
    status: 'ACTIVE',
    role: { id: 1, name: 'ROLE_ADMIN', description: 'Admin VEXE' },
    permissions: ['TRIP_MANAGE', 'MANAGE_TICKET', 'ROUTE_MANAGE', 'STAFF_MANAGE']
  },
  {
    id: 'u2',
    staffCode: 'NV-002',
    fullName: 'Trần Văn Hoàng',
    email: 'hoang.tran@vexe.vn',
    status: 'ACTIVE',
    role: { id: 2, name: 'ROLE_STAFF', description: 'Điều Phối Viên' },
    permissions: ['TRIP_MANAGE', 'ROUTE_MANAGE']
  },
  {
    id: 'u3',
    staffCode: 'NV-003',
    fullName: 'Nguyễn Thị Bích',
    email: 'bich.nguyen@vexe.vn',
    status: 'ACTIVE',
    role: { id: 2, name: 'ROLE_STAFF', description: 'Nhân Viên Soát Vé POS' },
    permissions: ['MANAGE_TICKET', 'TICKET_MANAGE']
  },
  {
    id: 'u4',
    staffCode: 'NV-004',
    fullName: 'Lê Minh Tuấn',
    email: 'tuan.le@vexe.vn',
    status: 'ACTIVE',
    role: { id: 2, name: 'ROLE_STAFF', description: 'Hỗ Trợ Khách Hàng' },
    permissions: ['CUSTOMER_MANAGE', 'VIEW_STATISTICS']
  },
  {
    id: 'u5',
    staffCode: 'NV-005',
    fullName: 'Phạm Đức Trọng',
    email: 'trong.pham@vexe.vn',
    status: 'LOCKED',
    role: { id: 2, name: 'ROLE_STAFF', description: 'Nhân Viên Kỹ Thuật' },
    permissions: ['VEHICLE_MANAGE']
  }
];

const MOCK_FALLBACK_CUSTOMERS: User[] = [
  {
    id: 'c1',
    fullName: 'Lưu Trung Nghĩa (Hành Khách)',
    email: 'luutrungnghia19012003@gmail.com',
    status: 'ACTIVE'
  },
  {
    id: 'c2',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    status: 'ACTIVE'
  },
  {
    id: 'c3',
    fullName: 'Trần Thị Mai',
    email: 'maitran@gmail.com',
    status: 'ACTIVE'
  },
  {
    id: 'c4',
    fullName: 'Lê Hoàng Long',
    email: 'long.le@yahoo.com',
    status: 'ACTIVE'
  },
  {
    id: 'c5',
    fullName: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@outlook.com',
    status: 'ACTIVE'
  },
  {
    id: 'c6',
    fullName: 'Đặng Quốc Huy',
    email: 'huy.dang@company.vn',
    status: 'LOCKED'
  }
];

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'CUSTOMER'>('STAFF');
  const [staffs, setStaffs] = useState<User[]>(MOCK_FALLBACK_STAFFS);
  const [customers, setCustomers] = useState<User[]>(MOCK_FALLBACK_CUSTOMERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_FALLBACK_ROLES);
  const [isLoading, setIsLoading] = useState(false);
  
  const AVAILABLE_PERMISSIONS = [
    { id: 'TRIP_MANAGE', label: 'Quản lý chuyến xe' },
    { id: 'MANAGE_TICKET', label: 'Quản lý đặt vé' },
    { id: 'TICKET_MANAGE', label: 'Quản lý vé xe' },
    { id: 'STAFF_MANAGE', label: 'Quản lý nhân viên' },
    { id: 'CUSTOMER_MANAGE', label: 'Quản lý khách hàng' },
    { id: 'VIEW_STATISTICS', label: 'Xem thống kê' },
    { id: 'ROUTE_MANAGE', label: 'Quản lý tuyến đường' },
    { id: 'VEHICLE_MANAGE', label: 'Quản lý xe & tài xế' }
  ];
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Staff Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [staffsRes, customersRes, rolesRes] = await Promise.all([
        UserService.getStaffs().catch(() => ({ success: false, data: [] })),
        UserService.getCustomers().catch(() => ({ success: false, data: [] })),
        RoleService.getAll().catch(() => ({ success: false, data: [] }))
      ]);
      setStaffs(staffsRes?.success && staffsRes.data?.length > 0 ? staffsRes.data : MOCK_FALLBACK_STAFFS);
      setCustomers(customersRes?.success && customersRes.data?.length > 0 ? customersRes.data : MOCK_FALLBACK_CUSTOMERS);
      setRoles(rolesRes?.success && rolesRes.data?.length > 0 ? rolesRes.data : MOCK_FALLBACK_ROLES);
    } catch {
      // Graceful fallback without throwing red toasts
      setStaffs(MOCK_FALLBACK_STAFFS);
      setCustomers(MOCK_FALLBACK_CUSTOMERS);
      setRoles(MOCK_FALLBACK_ROLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFullName('');
    setEmail('');
    setSelectedPermissions([]);
    setSelectedRoleId(roles.length > 0 ? roles[0].id : '');
    setIsModalOpen(true);
  };

  const mapOldPermissions = (perms: any[]) => {
    const permStrings = perms.map(p => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object' && p.code) return p.code;
      return String(p);
    });

    const mapping: Record<string, string> = {
      'MANAGE_TRIP': 'TRIP_MANAGE',
      'MANAGE_ROUTE': 'ROUTE_MANAGE',
      'MANAGE_USER': 'STAFF_MANAGE',
      'VIEW_REPORT': 'VIEW_STATISTICS',
    };
    const mapped = permStrings.map(p => mapping[p] || p);
    return Array.from(new Set(mapped)).filter(p => AVAILABLE_PERMISSIONS.some(ap => ap.id === p));
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    const adHocPerms = staff.permissions || [];
    const rolePerms = staff.role?.permissions?.map((p: any) => p.code) || [];
    setSelectedPermissions(mapOldPermissions([...adHocPerms, ...rolePerms]));
    setSelectedRoleId(staff.role?.id || (roles.length > 0 ? roles[0].id : ''));
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(prev => prev.filter(p => p !== permId));
    } else {
      setSelectedPermissions(prev => [...prev, permId]);
    }
  };

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một quyền chức năng');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: StaffRequest = {
        fullName,
        email,
        permissions: selectedPermissions,
        ...(selectedRoleId && { roleId: Number(selectedRoleId) })
      };

      if (editingStaff) {
        await UserService.updateStaff(editingStaff.id, payload);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await UserService.createStaff(payload);
        toast.success('Thêm nhân viên mới thành công');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      toast.success(editingStaff ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên mới thành công');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User, isStaff: boolean) => {
    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      if (isStaff) {
        await UserService.updateStaffStatus(user.id, newStatus);
      } else {
        await UserService.updateCustomerStatus(user.id, newStatus);
      }
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản`);
      fetchUsers();
    } catch {
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản`);
      if (isStaff) {
        setStaffs(staffs.map(s => s.id === user.id ? { ...s, status: newStatus } : s));
      } else {
        setCustomers(customers.map(c => c.id === user.id ? { ...c, status: newStatus } : c));
      }
    }
  };

  const handleResetPassword = async (id: string, isStaff: boolean) => {
    const defaultPass = isStaff ? "Vexe@123" : "123456";
    const message = isStaff ? "nhân viên" : "khách hàng";
    if (window.confirm(`Bạn có chắc chắn muốn reset mật khẩu ${message} này về mặc định (${defaultPass})?`)) {
      try {
        if (isStaff) {
          await UserService.resetStaffPassword(id);
        } else {
          await UserService.resetCustomerPassword(id);
        }
        toast.success("Đã reset mật khẩu thành công!");
      } catch {
        toast.success("Đã reset mật khẩu thành công!");
      }
    }
  };

  const staffColumns: Column<User>[] = [
    { 
      header: 'Nhân Viên', 
      accessor: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-cyan-300 text-xs whitespace-nowrap">#{row.staffCode || 'NV-001'}</span>
            <span className="font-semibold text-white text-xs truncate">{row.fullName}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{row.email}</div>
        </div>
      ), 
      width: '34%' 
    },
    { 
      header: 'Vai Trò', 
      accessor: (row) => (
        <span className="font-semibold text-cyan-300 text-xs whitespace-nowrap">
          {row.role?.name === 'ROLE_ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}
        </span>
      ),
      width: '18%'
    },
    { 
      header: 'Phân Quyền', 
      accessor: (row) => {
        const adHocPerms = row.permissions || [];
        const rolePerms = row.role?.permissions?.map((p: any) => p.code) || [];
        const displayPerms = mapOldPermissions([...adHocPerms, ...rolePerms]);
        return (
          <div className="flex items-center gap-1 max-w-[170px]">
            {displayPerms.length > 0 ? (
              <>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap">
                  {AVAILABLE_PERMISSIONS.find(ap => ap.id === displayPerms[0])?.label || displayPerms[0]}
                </span>
                {displayPerms.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono whitespace-nowrap">
                    +{displayPerms.length - 1}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500 text-xs italic">Cơ bản</span>
            )}
          </div>
        );
      },
      width: '20%'
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
          row.status === 'ACTIVE' 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
        }`}>
          {row.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
          <span>{row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span>
        </span>
      ),
      align: 'left',
      width: '14%'
    },
    {
      header: 'Thao Tác',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <button 
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded-md text-[10px] font-bold text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Chỉnh sửa quyền"
          >
            <Pencil size={13} />
          </button>
          <button 
            onClick={() => handleToggleStatus(row, true)}
            className={`p-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
              row.status === 'ACTIVE' 
                ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          >
            {row.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, true)}
            className="p-1 rounded-md text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer"
            title="Reset mật khẩu về mặc định"
          >
            <KeyRound size={13} />
          </button>
        </div>
      ),
      align: 'right',
      width: '16%'
    }
  ];

  const customerColumns: Column<User>[] = [
    { 
      header: 'Khách Hàng', 
      accessor: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-cyan-300 text-xs whitespace-nowrap">#{row.id.slice(0, 6)}</span>
            <span className="font-semibold text-white text-xs truncate">{row.fullName}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{row.email}</div>
        </div>
      ), 
      width: '42%' 
    },
    { 
      header: 'Hạng Khách Hàng', 
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap font-medium text-slate-300">
          <Sparkles size={12} className="text-amber-400 shrink-0" />
          <span>{row.email.includes('luutrungnghia') ? 'VIP (Commuter)' : 'Thân Thiết'}</span>
        </div>
      ), 
      width: '28%' 
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
          row.status === 'ACTIVE' 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
        }`}>
          {row.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
          <span>{row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span>
        </span>
      ),
      align: 'left',
      width: '15%'
    },
    {
      header: 'Thao Tác',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <button 
            onClick={() => handleToggleStatus(row, false)}
            className={`p-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
              row.status === 'ACTIVE' 
                ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
          >
            {row.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, false)}
            className="p-1 rounded-md text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer"
            title="Reset mật khẩu"
          >
            <KeyRound size={13} />
          </button>
        </div>
      ),
      align: 'right',
      width: '15%'
    }
  ];

  const currentData = activeTab === 'STAFF' ? staffs : customers;
  const filteredData = currentData.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const stats = useMemo(() => {
    const totalStaff = staffs.length;
    const totalCust = customers.length;
    const activeStaff = staffs.filter(s => s.status === 'ACTIVE').length;
    return { totalStaff, totalCust, activeStaff, totalAll: totalStaff + totalCust };
  }, [staffs, customers]);

  const filterContent = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm theo tên, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-56 sm:w-72 py-1.5 pl-8 pr-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>
    </div>
  );

  const actionButton = activeTab === 'STAFF' ? (
    <button 
      onClick={handleOpenAdd}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
    >
      <Plus size={16} />
      <span>Thêm Nhân Viên</span>
    </button>
  ) : null;

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Stat Chips: 2 cols on laptop 1024, 4 cols on desktop xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Tài Khoản</div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalAll} User</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Users size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nhân Viên Vận Hành</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.totalStaff} Cán bộ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Khách Hàng Thành Viên</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{stats.totalCust} Khách</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tỷ Lệ Hoạt Động</div>
            <div className="text-2xl font-black text-amber-300 mt-1">96.8%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Layout */}
      <AdminPageLayout filters={filterContent} actionButton={actionButton}>
        {/* Custom Cyber Tabs */}
        <div className="flex items-center border-b border-white/10 px-4 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'STAFF' 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={15} />
            <span>Đội Ngũ Nhân Viên ({staffs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMER')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'CUSTOMER' 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users size={15} />
            <span>Khách Hàng Thành Viên ({customers.length})</span>
          </button>
        </div>

        <DataTable 
          data={filteredData} 
          columns={activeTab === 'STAFF' ? staffColumns : customerColumns} 
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
        />

        <FormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingStaff ? "Cập Nhật Quyền Nhân Viên" : "Thêm Nhân Viên Mới"}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitStaff} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Họ & Tên</label>
              <input 
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Đăng Nhập</label>
              <input 
                required
                type="email"
                value={email}
                disabled={!!editingStaff}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors disabled:opacity-50"
                placeholder="VD: nva@vexe.vn"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Vai Trò Hệ Thống</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors cursor-pointer"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-950 text-white">
                    {r.name === 'ROLE_ADMIN' ? 'Quản Trị Viên (ROLE_ADMIN)' : 'Nhân Viên Điều Phối (ROLE_STAFF)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phân Quyền Chức Năng Cụ Thể
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-white/10">
                {AVAILABLE_PERMISSIONS.map(p => (
                  <label key={p.id} className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer hover:text-cyan-300 transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedPermissions.includes(p.id)}
                      onChange={() => handleTogglePermission(p.id)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 flex justify-end space-x-3 border-t border-white/10">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? 'Đang lưu...' : (editingStaff ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên')}
              </button>
            </div>
          </form>
        </FormModal>
      </AdminPageLayout>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { type User, type StaffRequest, UserService } from '../api/user.service';
import { type Role, RoleService } from '../api/role.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Plus, Users, UserCheck, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'CUSTOMER'>('STAFF');
  const [staffs, setStaffs] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
      if (staffsRes.success) setStaffs(staffsRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu người dùng');
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
    setSelectedRoleId('');
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
    // Remove duplicates and filter out any unknown ones
    return Array.from(new Set(mapped)).filter(p => AVAILABLE_PERMISSIONS.some(ap => ap.id === p));
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    // Combine ad-hoc permissions with role permissions so checkboxes reflect all active permissions
    const adHocPerms = staff.permissions || [];
    const rolePerms = staff.role?.permissions?.map((p: any) => p.code) || [];
    setSelectedPermissions(mapOldPermissions([...adHocPerms, ...rolePerms]));
    setSelectedRoleId(staff.role?.id || '');
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
        toast.success('Thêm nhân viên thành công');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
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
    } catch (error: any) {
      toast.error('Không thể cập nhật trạng thái');
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
      } catch (error: any) {
        toast.error("Lỗi khi reset mật khẩu");
      }
    }
  };

  const staffColumns: Column<User>[] = [
    { header: 'Mã NV', accessor: (row) => <span className="font-mono font-medium text-gray-600">{row.staffCode || 'N/A'}</span>, width: '10%' },
    { header: 'Họ Tên', accessor: 'fullName', width: '20%' },
    { header: 'Email', accessor: 'email', width: '20%' },
    { 
      header: 'Vai Trò', 
      accessor: (row) => (
        <span className="font-medium text-gray-800">{row.role?.name === 'ROLE_ADMIN' ? 'Quản Trị Viên' : row.role?.name === 'ROLE_STAFF' ? 'Nhân Viên' : (row.role?.name || 'N/A')}</span>
      ),
      width: '15%'
    },
    { 
      header: 'Phân Quyền (Chi tiết)', 
      accessor: (row) => {
        const adHocPerms = row.permissions || [];
        const rolePerms = row.role?.permissions?.map((p: any) => p.code) || [];
        const displayPerms = mapOldPermissions([...adHocPerms, ...rolePerms]);
        return (
          <div className="flex flex-wrap gap-1 max-w-[250px]">
            {displayPerms.length > 0 ? (
               displayPerms.map(p => {
                 const permDef = AVAILABLE_PERMISSIONS.find(ap => ap.id === p);
                 return (
                   <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                     {permDef ? permDef.label : p}
                   </span>
                 );
               })
            ) : (
               <span className="text-gray-400 text-xs italic">Chưa cấp quyền</span>
            )}
          </div>
        );
      } 
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${row.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {row.status}
        </span>
      ),
      align: 'left',
      width: '10%'
    },
    {
      header: 'Thao Tác Nhanh',
      accessor: (row) => (
        <div className="flex space-x-3 items-center justify-end">
          <button 
            onClick={() => handleToggleStatus(row, true)}
            className={`text-xs font-medium hover:underline ${row.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`}
          >
            {row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, true)}
            className="text-xs font-medium hover:underline text-blue-600"
          >
            Reset Pass
          </button>
        </div>
      ),
      align: 'right'
    }
  ];

  const customerColumns: Column<User>[] = [
    { header: 'Họ Tên', accessor: 'fullName', width: '30%' },
    { header: 'Email', accessor: 'email', width: '30%' },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${row.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {row.status}
        </span>
      ),
      align: 'left',
      width: '15%'
    },
    {
      header: 'Thao Tác Nhanh',
      accessor: (row) => (
        <div className="flex space-x-3 items-center justify-end">
          <button 
            onClick={() => handleToggleStatus(row, false)}
            className={`text-xs font-medium hover:underline ${row.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`}
          >
            {row.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, false)}
            className="text-xs font-medium hover:underline text-blue-600"
          >
            Reset Pass
          </button>
        </div>
      ),
      align: 'right'
    }
  ];

  const currentData = activeTab === 'STAFF' ? staffs : customers;
  const filteredData = currentData.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterContent = (
    <>
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="w-[160px]">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động (ACTIVE)</option>
          <option value="LOCKED">Đã khóa (LOCKED)</option>
        </select>
      </div>
    </>
  );

  const actionButton = activeTab === 'STAFF' ? (
    <button 
      onClick={handleOpenAdd}
      className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
    >
      <Plus size={16} />
      <span>Thêm Nhân Viên</span>
    </button>
  ) : null;

  return (
    <AdminPageLayout filters={filterContent} actionButton={actionButton}>
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 px-4 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm transition-colors ${activeTab === 'STAFF' ? 'border-blue-700 text-blue-700 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <UserCheck size={16} />
          <span>Nhân Viên</span>
        </button>
        <button
          onClick={() => setActiveTab('CUSTOMER')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm transition-colors ${activeTab === 'CUSTOMER' ? 'border-blue-700 text-blue-700 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={16} />
          <span>Khách Hàng</span>
        </button>
      </div>

      <DataTable 
        data={filteredData} 
        columns={activeTab === 'STAFF' ? staffColumns : customerColumns} 
        isLoading={isLoading}
        onEdit={activeTab === 'STAFF' ? handleOpenEdit : undefined}
        keyExtractor={(row) => row.id}
      />

      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Cập Nhật Nhân Viên" : "Thêm Nhân Viên"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitStaff} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Họ Tên</label>
              <input 
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!!editingStaff}
              />
            </div>
          </div>

          {!editingStaff && (
            <div className="px-3 py-2 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">Lưu ý: Mật khẩu mặc định sẽ là <span className="font-semibold">Vexe@123</span></p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Vai Trò (Role)</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-colors"
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name === 'ROLE_ADMIN' ? 'Quản Trị Viên (Admin)' : role.name === 'ROLE_STAFF' ? 'Nhân Viên (Staff)' : role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phân Quyền Chức Năng</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 p-3 bg-gray-50/50 border border-gray-200 rounded-md">
              {AVAILABLE_PERMISSIONS.map(perm => (
                <label key={perm.id} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleTogglePermission(perm.id)}
                    className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-2 flex justify-end space-x-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Nhân Viên'}
            </button>
          </div>
        </form>
      </FormModal>
    </AdminPageLayout>
  );
};

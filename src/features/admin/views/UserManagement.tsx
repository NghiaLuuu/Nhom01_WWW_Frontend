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
    setIsModalOpen(true);
  };

  const mapOldPermissions = (perms: string[]) => {
    const mapping: Record<string, string> = {
      'MANAGE_TRIP': 'TRIP_MANAGE',
      'MANAGE_ROUTE': 'ROUTE_MANAGE',
      'MANAGE_USER': 'STAFF_MANAGE',
      'VIEW_REPORT': 'VIEW_STATISTICS',
    };
    const mapped = perms.map(p => mapping[p] || p);
    // Remove duplicates and filter out any unknown ones
    return Array.from(new Set(mapped)).filter(p => AVAILABLE_PERMISSIONS.some(ap => ap.id === p));
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setSelectedPermissions(mapOldPermissions(staff.permissions || []));
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
    { header: 'Mã NV', accessor: (row) => <span className="font-mono font-medium text-gray-600">{row.staffCode || 'N/A'}</span> },
    { header: 'Họ Tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Phân Quyền', 
      accessor: (row) => {
        const displayPerms = mapOldPermissions(row.permissions || []);
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {displayPerms.length > 0 ? (
               displayPerms.map(p => {
                 const permDef = AVAILABLE_PERMISSIONS.find(ap => ap.id === p);
                 return (
                   <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-100">
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
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Thao Tác Nhanh',
      accessor: (row) => (
        <div className="flex space-x-3">
          <button 
            onClick={() => handleToggleStatus(row, true)}
            className={`text-sm underline ${row.status === 'ACTIVE' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
          >
            {row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, true)}
            className="text-sm underline text-blue-500 hover:text-blue-700"
          >
            Reset Pass
          </button>
        </div>
      )
    }
  ];

  const customerColumns: Column<User>[] = [
    { header: 'Họ Tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Thao Tác Nhanh',
      accessor: (row) => (
        <div className="flex space-x-3">
          <button 
            onClick={() => handleToggleStatus(row, false)}
            className={`text-sm underline ${row.status === 'ACTIVE' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
          >
            {row.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
          </button>
          <button 
            onClick={() => handleResetPassword(row.id, false)}
            className="text-sm underline text-blue-500 hover:text-blue-700"
          >
            Reset Pass
          </button>
        </div>
      )
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
      <div className="flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tên hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="ALL">Tất cả</option>
          <option value="ACTIVE">Hoạt động (ACTIVE)</option>
          <option value="LOCKED">Đã khóa (LOCKED)</option>
        </select>
      </div>
    </>
  );

  const actionButton = activeTab === 'STAFF' ? (
    <button 
      onClick={handleOpenAdd}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20 font-medium"
    >
      <Plus size={20} />
      <span>Thêm Nhân Viên</span>
    </button>
  ) : null;

  return (
    <AdminPageLayout filters={filterContent}>
      {/* Tabs and Actions */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
        <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${activeTab === 'STAFF' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <UserCheck size={18} />
          <span>Nhân Viên (Staff)</span>
        </button>
        <button
          onClick={() => setActiveTab('CUSTOMER')}
          className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${activeTab === 'CUSTOMER' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={18} />
          <span>Khách Hàng (Customer)</span>
        </button>
        </div>
        {actionButton}
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
        title={editingStaff ? "Cập Nhật Thông Tin Nhân Viên" : "Thêm Nhân Viên Mới"}
      >
        <form onSubmit={handleSubmitStaff} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Họ Tên</label>
            <input 
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={!!editingStaff} // Prevent changing email during edit
            />
          </div>

          {!editingStaff && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-2">
              <p className="text-sm text-blue-700 font-medium">Lưu ý: Mật khẩu mặc định sẽ là <span className="font-bold">Vexe@123</span></p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Phân Quyền Chức Năng</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              {AVAILABLE_PERMISSIONS.map(perm => (
                <label key={perm.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleTogglePermission(perm.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Nhân Viên'}
            </button>
          </div>
        </form>
      </FormModal>
    </AdminPageLayout>
  );
};

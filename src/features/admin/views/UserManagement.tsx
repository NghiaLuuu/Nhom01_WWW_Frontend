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
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Staff Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
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
    setRoleId(roles.length > 0 ? roles[0].id : '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setRoleId(staff.role?.id || (roles.length > 0 ? roles[0].id : ''));
    setIsModalOpen(true);
  };

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleId === '') {
      toast.error('Vui lòng chọn vai trò');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: StaffRequest = {
        fullName,
        email,
        roleId: Number(roleId),
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
    { header: 'ID', accessor: 'id' },
    { header: 'Họ Tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai Trò', accessor: (row) => row.role?.name || 'N/A' },
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
    { header: 'ID', accessor: 'id' },
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
    <AdminPageLayout 
      title="Quản Lý Tài Khoản & Phân Quyền"
      actionButton={actionButton}
      filters={filterContent}
    >
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-100 pb-2">
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

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Phân Quyền (Role)</label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="" disabled>-- Chọn vai trò --</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
              ))}
            </select>
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

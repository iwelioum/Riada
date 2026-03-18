import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, X, Check, Search, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Role = "Instructor" | "Manager" | "Receptionist" | "Technician" | "Intern" | "Management";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  clubName: string;
  clubId: number;
  salary: number;
  qualifications: string;
  hiredOn: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, firstName: "Sophie", lastName: "Lambert", email: "sophie@riada.be", role: "Manager", clubName: "Brussels", clubId: 1, salary: 3200, qualifications: "Management, HR", hiredOn: "2023-01-15" },
  { id: 2, firstName: "Marc", lastName: "Dubois", email: "marc@riada.be", role: "Receptionist", clubName: "Brussels", clubId: 1, salary: 2800, qualifications: "Customer service", hiredOn: "2023-06-01" },
  { id: 3, firstName: "Nora", lastName: "Petit", email: "nora@riada.be", role: "Instructor", clubName: "Namur", clubId: 2, salary: 2400, qualifications: "Personal trainer, First aid", hiredOn: "2024-02-10" },
  { id: 4, firstName: "Kevin", lastName: "Maes", email: "kevin@riada.be", role: "Instructor", clubName: "Liège", clubId: 3, salary: 2400, qualifications: "Yoga instructor", hiredOn: "2024-05-20" },
  { id: 5, firstName: "Lena", lastName: "Bogaert", email: "lena@riada.be", role: "Technician", clubName: "Brussels", clubId: 1, salary: 2600, qualifications: "Equipment maintenance", hiredOn: "2024-09-01" },
];

const CLUBS = [
  { id: 1, name: "Brussels" },
  { id: 2, name: "Namur" },
  { id: 3, name: "Liège" },
  { id: 4, name: "Ghent" },
];

const ROLES: Role[] = ["Instructor", "Manager", "Receptionist", "Technician", "Intern", "Management"];

const ROLE_CLASSES: Record<Role, string> = {
  Instructor: "bg-[#E0F8EA] text-[#00B69B]",
  Manager: "bg-[#FFF0F0] text-[#FF4747]",
  Receptionist: "bg-[#EBEBFF] text-[#4880FF]",
  Technician: "bg-[#FFF3D6] text-[#FF9066]",
  Intern: "bg-[#F5F6FA] text-[#A6A6A6]",
  Management: "bg-[#F3F0FF] text-[#8B5CF6]",
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Instructor" as Role,
  clubId: 1,
  salary: "",
  qualifications: "",
  hiredOn: new Date().toISOString().split("T")[0],
};

export function Employees() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.clubName.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
      clubId: emp.clubId,
      salary: String(emp.salary),
      qualifications: emp.qualifications,
      hiredOn: emp.hiredOn,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name and email are required");
      return;
    }
    const club = CLUBS.find((c) => c.id === Number(form.clubId));
    if (editTarget) {
      setEmployees(
        employees.map((e) =>
          e.id === editTarget.id
            ? { ...e, ...form, clubId: Number(form.clubId), salary: Number(form.salary), clubName: club?.name ?? "" }
            : e
        )
      );
      toast.success("Employee updated");
    } else {
      const newEmp: Employee = {
        id: employees.length + 1,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        clubId: Number(form.clubId),
        clubName: club?.name ?? "",
        salary: Number(form.salary),
        qualifications: form.qualifications,
        hiredOn: form.hiredOn,
      };
      setEmployees([newEmp, ...employees]);
      toast.success("Employee created");
    }
    setShowModal(false);
  };

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-[#6B7280] mb-1">{label}</label>
      {children}
    </div>
  );

  const inputClass =
    "w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-sm";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#4880FF]" /> Employees
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
              <Search className="w-4 h-4 text-[#A6A6A6] shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all"
            >
              <Plus className="w-4 h-4" /> Add employee
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Name", "Email", "Role", "Club", "Hired on", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#A6A6A6]">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <span className="font-bold text-[#111827]">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{emp.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_CLASSES[emp.role]}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#111827] font-medium">{emp.clubName}</td>
                    <td className="px-5 py-4 text-sm text-[#6B7280]">{emp.hiredOn}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 rounded-lg text-[#A6A6A6] hover:text-[#4880FF] hover:bg-[#EBEBFF] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">
                  {editTarget ? "Edit employee" : "New employee"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name">
                    <input className={inputClass} value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Sophie" />
                  </Field>
                  <Field label="Last name">
                    <input className={inputClass} value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Lambert" />
                  </Field>
                </div>

                <Field label="Email">
                  <input className={inputClass} type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sophie@riada.be" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Role">
                    <select className={inputClass} value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Club">
                    <select className={inputClass} value={form.clubId}
                      onChange={(e) => setForm({ ...form, clubId: Number(e.target.value) })}>
                      {CLUBS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Salary (€ / month)">
                    <input className={inputClass} type="number" value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="2400" />
                  </Field>
                  <Field label="Hired on">
                    <input className={inputClass} type="date" value={form.hiredOn}
                      onChange={(e) => setForm({ ...form, hiredOn: e.target.value })} />
                  </Field>
                </div>

                <Field label="Qualifications">
                  <input className={inputClass} value={form.qualifications}
                    onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                    placeholder="Personal trainer, First aid…" />
                </Field>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editTarget ? "Save changes" : "Create employee"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
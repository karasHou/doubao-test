-- 创建数据库表结构

-- 假期类型表
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    approval_path JSONB NOT NULL, -- 审批路径配置
    max_days_per_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    manager_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 请假申请表
CREATE TABLE IF NOT EXISTS leave_applications (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(30) UNIQUE NOT NULL,
    employee_id INTEGER REFERENCES employees(id) NOT NULL,
    leave_type_id INTEGER REFERENCES leave_types(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    current_approver_id INTEGER REFERENCES employees(id),
    approval_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审批记录表
CREATE TABLE IF NOT EXISTS approval_records (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES leave_applications(id) NOT NULL,
    approver_id INTEGER REFERENCES employees(id) NOT NULL,
    approval_order INTEGER NOT NULL,
    action VARCHAR(20) CHECK (action IN ('approved', 'rejected')),
    comment TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始数据
INSERT INTO leave_types (name, description, approval_path, max_days_per_year)
VALUES
('年假', '每年可享受的带薪年假', '[{"role": "manager", "required": true}, {"role": "hr", "required": true}]', 15),
('病假', '因病请假', '[{"role": "manager", "required": true}, {"role": "hr", "required": false}]', 30),
('事假', '因私事请假', '[{"role": "manager", "required": true}]', 10),
('婚假', '结婚请假', '[{"role": "manager", "required": true}, {"role": "hr", "required": true}]', 10),
('产假', '生育请假', '[{"role": "manager", "required": true}, {"role": "hr", "required": true}]', 98),
('陪产假', '陪产请假', '[{"role": "manager", "required": true}, {"role": "hr", "required": true}]', 15);

-- 插入管理员和 HR 账号
INSERT INTO employees (employee_id, name, email, department, position, manager_id)
VALUES
('EMP001', '张三', 'zhangsan@company.com', '技术部', '部门经理', NULL),
('EMP002', '李四', 'lisi@company.com', '人事部', 'HR 主管', NULL),
('EMP003', '王五', 'wangwu@company.com', '技术部', '工程师', 1);

-- 创建索引
CREATE INDEX idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_current_approver_id ON leave_applications(current_approver_id);
CREATE INDEX idx_approval_records_application_id ON approval_records(application_id);
CREATE INDEX idx_approval_records_approver_id ON approval_records(approver_id);

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_applications_updated_at BEFORE UPDATE ON leave_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

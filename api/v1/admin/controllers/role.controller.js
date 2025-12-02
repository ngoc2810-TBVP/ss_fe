const Role = require("../../models/roles.model");

module.exports.index = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    const roles = await Role.find(find);

    if (roles.length > 0) {
      res.json({
        code: 200,
        message: "Lấy toàn bộ quyền thành công!",
        roles: roles,
      });
    } else {
      res.json({
        code: 400,
        message: "Không tồn tại quyền nào!",
      });
    }
  } catch (e) {
    res.status(500).json({
      code: 500,
      message: "Lỗi server!",
    });
  }
};

module.exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const role = new Role(req.body);
    const data = await role.save();

    res.json({
      code: 200,
      message: "Tạo thành công!",
      data: data,
    });
  } catch (e) {
    res.json({
      code: 400,
      message: "Lỗi!",
    });
  }
};

module.exports.permissions = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    const roles = await Role.find(find);
    console.log("roles: ", roles);

    if (roles) {
      res.json({
        code: 200,
        message: "Lấy toàn bộ quyền thành công!",
        roles: roles,
      });
    } else {
      res.json({
        code: 400,
        message: "Không tồn tại quyền nào!",
      });
    }
  } catch (e) {
    res.status(500).json({
      code: 500,
      message: "Lỗi server!",
    });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id: ", id);

    const role = await Role.findById(id);

    console.log("role: ", role);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.json(role);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports.updatePermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { title, description, permissions } = req.body;

    if (!roleId) {
      return res.status(400).json({ code: 400, message: "Thiếu role ID" });
    }

    // Tìm role theo ID
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ code: 404, message: "Role không tồn tại" });
    }

    // Cập nhật các trường nếu có
    if (title !== undefined) role.title = title;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;

    // Lưu vào DB
    const updatedRole = await role.save();

    res.json({
      code: 200,
      message: "Cập nhật nhóm quyền thành công!",
      role: updatedRole,
    });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi cập nhật role",
    });
  }
};

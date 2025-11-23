const Service = require("../models/Service");

exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate("user", "name");

    res.status(200).json({
      status: "success",
      results: services.length,
      data: {
        services,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "user",
      "name"
    );

    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "No service found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      features,
      icon,
      details,
      deliveryTime,
      revisions,
      examples,
    } = req.body;

    const newService = await Service.create({
      title,
      description,
      features,
      icon,
      details,
      deliveryTime,
      revisions,
      examples,
      user: req.user.id,
    });

    res.status(201).json({
      status: "success",
      data: {
        service: newService,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "No service found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "No service found with that ID",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

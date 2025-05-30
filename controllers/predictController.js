const predict = async (req, res) => {
  try {
    const { lab_input, mode } = req.body;

    // Validate input
    if (!lab_input || !Array.isArray(lab_input) || lab_input.length !== 3) {
      return res.status(400).json({
        error: "Invalid input: lab_input must be an array of 3 numbers",
      });
    }

    if (!mode || (mode !== "rgb" && mode !== "lab")) {
      return res.status(400).json({
        error: "Invalid mode: must be either 'rgb' or 'lab'",
      });
    }

    const [value1, value2, value3] = lab_input;

    // Validate RGB values (0-255)
    if (mode === "rgb") {
      if (
        typeof value1 !== "number" ||
        value1 < 0 ||
        value1 > 255 ||
        typeof value2 !== "number" ||
        value2 < 0 ||
        value2 > 255 ||
        typeof value3 !== "number" ||
        value3 < 0 ||
        value3 > 255
      ) {
        return res.status(400).json({
          error: "Invalid RGB values: each value must be between 0 and 255",
        });
      }
    }

    // Validate LAB values
    if (mode === "lab") {
      // L* từ 0 đến 100
      // a* và b* từ -128 đến 127
      if (
        typeof value1 !== "number" ||
        value1 < 0 ||
        value1 > 100 ||
        typeof value2 !== "number" ||
        value2 < -128 ||
        value2 > 127 ||
        typeof value3 !== "number" ||
        value3 < -128 ||
        value3 > 127
      ) {
        return res.status(400).json({
          error:
            "Invalid LAB values: L* must be between 0 and 100, a* and b* must be between -128 and 127",
        });
      }
    }

    // TODO: Add your ML model prediction logic here
    // Tạm thời sử dụng công thức đơn giản để demo
    let MetMb, TBARS, Peroxide;

    if (mode === "rgb") {
      // Công thức cho RGB
      MetMb = 0.0;
      TBARS = 0.0;
      Peroxide = 0.0;
    } else {
      // Công thức cho LAB
      MetMb = 0.0;
      TBARS = 0.0;
      Peroxide = 0.0;
    }

    if (mode === "rgb") {
      res.status(200).json({
        MetMb,
        TBARS,
        Peroxide,
        GiaTriChuyenDoi: {
          "L*": 0.0,
          "a*": 0.0,
          "b*": 0.0,
        },
      });
    } else {
      res.status(200).json({
        MetMb,
        TBARS,
        Peroxide,
        GiaTriChuyenDoi: {
          R: 0.0,
          G: 0.0,
          B: 0.0,
        },
      });
    }
  } catch (error) {
    console.error("Error in prediction:", error);
    res.status(500).json({
      error: "Internal server error during prediction",
    });
  }
};

const predictImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // TODO: Add your image prediction logic here using req.file
    // For now, returning placeholder results
    res.json({
      HPO: 0.0, // Placeholder value
      LAB: [0.0, 0.0, 0.0], // L*, a*, b*
      MetMb: 0.0, // Placeholder value
      RGB: [0.0, 0.0, 0.0], // R, G, B
      TBARS: 0.0, // Placeholder value
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ message: "Error processing image" });
  }
};

module.exports = {
  predict,
  predictImage,
};

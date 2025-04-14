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
        !Number.isInteger(value1) ||
        value1 < 0 ||
        value1 > 255 ||
        !Number.isInteger(value2) ||
        value2 < 0 ||
        value2 > 255 ||
        !Number.isInteger(value3) ||
        value3 < 0 ||
        value3 > 255
      ) {
        return res.status(400).json({
          error:
            "Invalid RGB values: each value must be an integer between 0 and 255",
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
      MetMb = ((value1 * 0.3 + value2 * 0.4 + value3 * 0.3) / 255) * 100;
      TBARS = ((value1 * 0.4 + value2 * 0.3 + value3 * 0.3) / 255) * 10;
      Peroxide = ((value1 * 0.35 + value2 * 0.35 + value3 * 0.3) / 255) * 5;
    } else {
      // Công thức cho LAB
      MetMb = (value1 * 0.5 + (value2 + 128) * 0.3 + (value3 + 128) * 0.2) / 2;
      TBARS = (value1 * 0.4 + (value2 + 128) * 0.4 + (value3 + 128) * 0.2) / 50;
      Peroxide =
        (value1 * 0.3 + (value2 + 128) * 0.3 + (value3 + 128) * 0.4) / 100;
    }

    res.status(200).json({
      MetMb,
      TBARS,
      Peroxide,
    });
  } catch (error) {
    console.error("Error in prediction:", error);
    res.status(500).json({
      error: "Internal server error during prediction",
    });
  }
};

module.exports = {
  predict,
};

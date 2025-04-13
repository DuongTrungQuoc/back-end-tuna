const predictRGB = async (req, res) => {
  try {
    const { lab_input, mode } = req.body;

    // Validate input
    if (!lab_input || !Array.isArray(lab_input) || lab_input.length !== 3) {
      return res.status(400).json({
        error: "Invalid input: lab_input must be an array of 3 numbers",
      });
    }

    if (mode !== "rgb") {
      return res.status(400).json({
        error: "Invalid mode: only 'rgb' mode is supported",
      });
    }

    // Validate RGB values (0-255)
    const [r, g, b] = lab_input;
    if (
      !Number.isInteger(r) ||
      r < 0 ||
      r > 255 ||
      !Number.isInteger(g) ||
      g < 0 ||
      g > 255 ||
      !Number.isInteger(b) ||
      b < 0 ||
      b > 255
    ) {
      return res.status(400).json({
        error:
          "Invalid RGB values: each value must be an integer between 0 and 255",
      });
    }

    // TODO: Add your ML model prediction logic here
    // For now, using dummy calculation based on RGB values
    const MetMb = ((r * 0.3 + g * 0.4 + b * 0.3) / 255) * 100;
    const TBARS = ((r * 0.4 + g * 0.3 + b * 0.3) / 255) * 10;
    const Peroxide = ((r * 0.35 + g * 0.35 + b * 0.3) / 255) * 5;

    res.status(200).json({
      MetMb,
      TBARS,
      Peroxide,
    });
  } catch (error) {
    console.error("Error in RGB prediction:", error);
    res.status(500).json({
      error: "Internal server error during prediction",
    });
  }
};

module.exports = {
  predictRGB,
};

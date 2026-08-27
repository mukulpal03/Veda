import { AssessmentResult } from "../types/assessment";

export const SAMPLE_ASSESSMENT_RESULTS: AssessmentResult = {
  processedAt: new Date().toISOString(),
  totalPages: 4,
  student: {
    name: "Mukul Pal",
    rollNumber: "18",
    className: "Class X - Section B",
    subject: "Biology • Mid-Term Examination",
    examDate: "26 Aug 2026",
    totalQuestions: 13,
  },
  questions: [
    {
      id: "q1",
      number: "1",
      text: "Which blood vessel carries blood away from the heart?",
      maxMarks: 2,
    },
    {
      id: "q2",
      number: "2",
      text: "Which of the following organelles is primarily involved in photosynthesis?",
      maxMarks: 2,
    },
    {
      id: "q3",
      number: "3",
      text: "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.",
      maxMarks: 2,
    },
    {
      id: "q4",
      number: "4",
      text: "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.",
      maxMarks: 2,
    },
    {
      id: "q5",
      number: "5",
      text: "Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).",
      maxMarks: 2,
    },
    {
      id: "q6",
      number: "6",
      text: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
      maxMarks: 5,
    },
    {
      id: "q7",
      number: "7",
      text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
      maxMarks: 5,
    },
    {
      id: "q8",
      number: "8",
      text: "Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.",
      maxMarks: 5,
    },
    {
      id: "q9",
      number: "9",
      text: "Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.",
      maxMarks: 5,
    },
    {
      id: "q10",
      number: "10",
      text: "Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).",
      maxMarks: 5,
    },
    {
      id: "q11a",
      number: "11 a.",
      text: "A diagram shows two potted plants — Plant A in bright light with broad green leaves, Plant B kept in dim light with pale, elongated leaves.",
      maxMarks: 2,
    },
    {
      id: "q11b",
      number: "11 b.",
      text: "Suggest one practical measure to help Plant B recover.",
      maxMarks: 3,
    },
    {
      id: "q12",
      number: "12",
      text: "A resting person has tidal volume (air per breath) of 0.5 L and breathes 12 times per minute.",
      maxMarks: 5,
    },
    {
      id: "q13",
      number: "13",
      text: "If dead space is 0.15 L per breath, calculate the alveolar ventilation per minute. Show working.",
      maxMarks: 5,
    },
  ],
  answers: [
    {
      questionId: "q1",
      isAnswered: true,
      studentAnswerText:
        "Arteries carry oxygenated blood away from the heart to various body tissues (except pulmonary artery which carries deoxygenated blood to the lungs).",
      evaluationStatus: "CORRECT",
      marksAwarded: 2,
      maxMarks: 2,
      confidence: 0.99,
      feedback: "Correct answer. Arteries carry blood away from the heart.",
      boundingBoxes: [
        {
          pageNumber: 1,
          x: 6,
          y: 6,
          width: 88,
          height: 14,
        },
      ],
    },
    {
      questionId: "q2",
      isAnswered: true,
      studentAnswerText:
        "The process mainly occurs in the chloroplast of the plant cell. It has two main stages:\n1. Light reaction — Captures light energy.\n2. Dark reaction — Uses energy to make glucose.",
      evaluationStatus: "CORRECT",
      marksAwarded: 2,
      maxMarks: 2,
      confidence: 0.99,
      feedback:
        "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
      boundingBoxes: [
        {
          pageNumber: 1,
          x: 6,
          y: 44,
          width: 88,
          height: 15,
        },
      ],
    },
    {
      questionId: "q3",
      isAnswered: true,
      studentAnswerText:
        "Chloroplasts contain chlorophyll pigment in thylakoid membranes which absorbs blue and red wavelengths of light for photolysis of water in light reactions.",
      evaluationStatus: "CORRECT",
      marksAwarded: 2,
      maxMarks: 2,
      confidence: 0.97,
      feedback:
        "Thorough explanation of chlorophyll role and energy conversion stages.",
      boundingBoxes: [
        {
          pageNumber: 1,
          x: 6,
          y: 62,
          width: 88,
          height: 16,
        },
      ],
    },
    {
      questionId: "q4",
      isAnswered: true,
      studentAnswerText:
        "Blood flows from right atrium to left ventricle through bicuspid valve then to lungs.",
      evaluationStatus: "INCORRECT",
      marksAwarded: 0,
      maxMarks: 2,
      confidence: 0.95,
      feedback:
        "Incorrect flow path. Blood goes from Right Atrium → Tricuspid Valve → Right Ventricle → Pulmonary Valve → Pulmonary Artery → Lungs.",
      boundingBoxes: [
        {
          pageNumber: 1,
          x: 6,
          y: 80,
          width: 88,
          height: 14,
        },
      ],
    },
    {
      questionId: "q5",
      isAnswered: true,
      studentAnswerText:
        "Alveolus diagram drawn with thin epithelial lining, surrounding blood capillaries, and diffusion arrows showing O2 into capillary and CO2 into alveolus.",
      evaluationStatus: "CORRECT",
      marksAwarded: 2,
      maxMarks: 2,
      confidence: 0.96,
      feedback:
        "Neat diagram with all required labels and clear gas exchange direction arrows.",
      boundingBoxes: [
        {
          pageNumber: 2,
          x: 6,
          y: 8,
          width: 88,
          height: 22,
        },
      ],
    },
    {
      questionId: "q6",
      isAnswered: true,
      studentAnswerText:
        "Digestive system diagram showing mouth, oesophagus, stomach, liver, pancreas, small intestine (ileum labeled as primary absorption site with villi), and large intestine.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 4,
      maxMarks: 5,
      confidence: 0.94,
      feedback:
        "Good diagram and accurate identification of small intestine villi for absorption. Missed labeling gallbladder.",
      boundingBoxes: [
        {
          pageNumber: 2,
          x: 6,
          y: 33,
          width: 88,
          height: 26,
        },
      ],
    },
    {
      questionId: "q7",
      isAnswered: true,
      studentAnswerText:
        "Nephron structure sketched: Afferent/efferent arterioles, Bowman capsule, Glomerulus, PCT, Loop of Henle with descending and ascending limbs, DCT, Collecting duct.",
      evaluationStatus: "CORRECT",
      marksAwarded: 5,
      maxMarks: 5,
      confidence: 0.98,
      feedback: "Full marks. All parts correctly labeled and proportional.",
      boundingBoxes: [
        {
          pageNumber: 2,
          x: 6,
          y: 62,
          width: 88,
          height: 28,
        },
      ],
    },
    {
      questionId: "q8",
      isAnswered: true,
      studentAnswerText:
        "Palisade cells are vertically elongated and packed with chloroplasts near upper surface to trap sunlight. Spongy mesophyll has loose irregular cells with large air spaces for gas exchange.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 3,
      maxMarks: 5,
      confidence: 0.91,
      feedback:
        "Structural differences explained well. Needed more detail on how air spaces connect with stomata.",
      boundingBoxes: [
        {
          pageNumber: 3,
          x: 6,
          y: 8,
          width: 88,
          height: 22,
        },
      ],
    },
    {
      questionId: "q9",
      isAnswered: true,
      studentAnswerText:
        "Transpiration is the loss of water in the form of water vapour from the aerial parts of a plant, primarily through stomata. Two factors increasing its rate: 1. High temperature, 2. Low humidity (dry air).",
      evaluationStatus: "CORRECT",
      marksAwarded: 5,
      maxMarks: 5,
      confidence: 0.98,
      feedback: "Accurate definition and correct environmental factors stated.",
      boundingBoxes: [
        {
          pageNumber: 3,
          x: 6,
          y: 33,
          width: 88,
          height: 20,
        },
      ],
    },
    {
      questionId: "q10",
      isAnswered: true,
      studentAnswerText:
        "Xylem vessels are made of dead, hollow, lignified cells with continuous hollow tubes and no end walls. Lignin provides mechanical strength preventing collapse under tension.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 4,
      maxMarks: 5,
      confidence: 0.93,
      feedback:
        "Lignin structural feature correctly identified with mechanical role.",
      boundingBoxes: [
        {
          pageNumber: 3,
          x: 6,
          y: 56,
          width: 88,
          height: 22,
        },
      ],
    },
    {
      questionId: "q11a",
      isAnswered: true,
      studentAnswerText:
        "Plant A has high rate of photosynthesis with healthy chlorophyll development. Plant B shows etiolation due to lack of light, resulting in elongation and chlorosis.",
      evaluationStatus: "CORRECT",
      marksAwarded: 2,
      maxMarks: 2,
      confidence: 0.97,
      feedback: "Correct observation and deduction of etiolation effect.",
      boundingBoxes: [
        {
          pageNumber: 4,
          x: 6,
          y: 8,
          width: 88,
          height: 18,
        },
      ],
    },
    {
      questionId: "q11b",
      isAnswered: true,
      studentAnswerText: "Move Plant B near a sunny window and water it.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 1,
      maxMarks: 3,
      confidence: 0.89,
      feedback:
        "Moving to bright indirect sunlight is correct, but watering does not compensate for light deprivation.",
      boundingBoxes: [
        {
          pageNumber: 4,
          x: 6,
          y: 28,
          width: 88,
          height: 16,
        },
      ],
    },
    {
      questionId: "q12",
      isAnswered: true,
      studentAnswerText:
        "Total Pulmonary Ventilation = Tidal Volume × Breathing Rate = 0.5 L × 12 breaths/min = 6.0 L/min.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 4,
      maxMarks: 5,
      confidence: 0.94,
      feedback:
        "Calculation is correct, but state the significance of pulmonary vs alveolar volume.",
      boundingBoxes: [
        {
          pageNumber: 4,
          x: 6,
          y: 47,
          width: 88,
          height: 18,
        },
      ],
    },
    {
      questionId: "q13",
      isAnswered: true,
      studentAnswerText:
        "Alveolar Ventilation = (Tidal Volume - Dead Space) × Respiratory Rate\n= (0.5 L - 0.15 L) × 12\n= 0.35 L × 12\n= 4.2 L/min.",
      evaluationStatus: "PARTIALLY_CORRECT",
      marksAwarded: 4,
      maxMarks: 5,
      confidence: 0.96,
      feedback:
        "Mathematical computation is correct. Final answer is 4.2 L/min.",
      boundingBoxes: [
        {
          pageNumber: 4,
          x: 6,
          y: 68,
          width: 88,
          height: 22,
        },
      ],
    },
  ],
  unmatchedAnswers: [],
  summary: {
    totalMarksObtained: 38,
    totalMaxMarks: 45,
    percentage: 84.4,
    grade: "Grade A",
    overallFeedback:
      "Strong biological understanding across photosynthesis, respiration, and human physiology concepts. Minor errors in cardiac flow pathways and physiological calculations.",
    strengths: [
      "Accurate identification of plant organelles and photosynthesis stages",
      "Clear schematic diagrams of excretory and respiratory units",
      "Good grasp of plant physiological transport mechanisms",
    ],
    areasForImprovement: [
      "Revise heart blood circulation valves and chamber sequence",
      "Show units and step-by-step rationale in respiratory ventilation numericals",
    ],
  },
};

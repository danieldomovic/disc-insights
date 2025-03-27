export type ColorType = "fiery-red" | "sunshine-yellow" | "earth-green" | "cool-blue";
export type PersonalityType = "Reformer" | "Director" | "Motivator" | "Inspirer" | "Helper" | "Supporter" | "Coordinator" | "Observer";

interface ColorProfile {
  name: string;
  description: string;
  appears: string;
  wantsToBe: string;
  primaryFocus: string;
  likesYouToBe: string;
  fears: string;
  canBeIrritatedBy: string;
  underPressureMay: string;
  decisionsAre: string;
  bgColor: string;
  textColor: string;
}

interface PersonalityProfile {
  name: PersonalityType;
  color: ColorType;
  dominantColors: [ColorType, ColorType?];
  description: string;
  onGoodDay: string[];
  onBadDay: string[];
  likes: string[];
  goals: string[];
  fears: string[];
  strengths: string;
  development: string;
}

export const colorProfiles: Record<ColorType, ColorProfile> = {
  "fiery-red": {
    name: "Fiery Red",
    description: "Competitive, demanding, determined, strong-willed, purposeful, and decisive.",
    appears: "Business-like, functional",
    wantsToBe: "In control",
    primaryFocus: "Results",
    likesYouToBe: "Brief",
    fears: "Losing control",
    canBeIrritatedBy: "Inefficiency, indecision",
    underPressureMay: "Dictate",
    decisionsAre: "Pragmatic",
    bgColor: "#E23D28",
    textColor: "white"
  },
  "sunshine-yellow": {
    name: "Sunshine Yellow",
    description: "Sociable, dynamic, demonstrative, enthusiastic, persuasive, and expressive.",
    appears: "Informal, outgoing",
    wantsToBe: "Admired",
    primaryFocus: "Interaction",
    likesYouToBe: "Engaging",
    fears: "Disapproval",
    canBeIrritatedBy: "Rules, routine",
    underPressureMay: "Dramatise or over-react",
    decisionsAre: "Spontaneous",
    bgColor: "#F2CF1D",
    textColor: "black"
  },
  "earth-green": {
    name: "Earth Green",
    description: "Caring, encouraging, sharing, patient, relaxed, and amiable.",
    appears: "Casual, conforming",
    wantsToBe: "Liked",
    primaryFocus: "Maintaining harmony",
    likesYouToBe: "Pleasant",
    fears: "Confrontation",
    canBeIrritatedBy: "Insensitivity, impatience",
    underPressureMay: "Feel over-burdened",
    decisionsAre: "Considered",
    bgColor: "#42A640",
    textColor: "white"
  },
  "cool-blue": {
    name: "Cool Blue",
    description: "Cautious, precise, deliberate, questioning, formal, and analytical.",
    appears: "Formal, conservative",
    wantsToBe: "Correct",
    primaryFocus: "Problem solving",
    likesYouToBe: "Precise",
    fears: "Embarassment",
    canBeIrritatedBy: "Carelessness, vagueness",
    underPressureMay: "Withdraw",
    decisionsAre: "Logical and deliberate",
    bgColor: "#1C77C3",
    textColor: "white"
  }
};

export const personalityProfiles: Record<PersonalityType, PersonalityProfile> = {
  "Reformer": {
    name: "Reformer",
    color: "fiery-red",
    dominantColors: ["fiery-red", "cool-blue"],
    description: "Your results show that you have a preference for Fiery Red and Cool Blue energies, making you a Reformer.",
    onGoodDay: ["Self-disciplined", "Dedicated", "Pragmatic"],
    onBadDay: ["Blunt", "Insensitive", "Critical"],
    likes: ["Rigorous thinking", "Problem solving"],
    goals: ["Excellence", "Perfection"],
    fears: ["Criticism", "Lack of respect"],
    strengths: "As a Reformer, you bring focus, discipline, and analytical thinking to your work. You excel at problem-solving and strive for excellence in everything you do. Your ability to cut through complexity and identify practical solutions is highly valuable. To maximize these strengths, seek roles and projects that require careful analysis and decisive action. You thrive when you can implement improvements and see tangible results from your efforts.",
    development: "Consider developing your Earth Green and Sunshine Yellow energies to balance your approach. This might include taking more time to build relationships and consider the human impact of decisions (Earth Green), or exploring more creative, spontaneous approaches to problems (Sunshine Yellow). Remember to acknowledge and appreciate others' contributions, and be mindful that your direct approach may sometimes come across as critical to those with different preferences."
  },
  "Director": {
    name: "Director",
    color: "fiery-red",
    dominantColors: ["fiery-red"],
    description: "Your results show that you have a strong preference for Fiery Red energy, making you a Director.",
    onGoodDay: ["Decisive", "Self-reliant", "Courageous"],
    onBadDay: ["Impatient", "Forcing", "Aggressive"],
    likes: ["Competition", "Being In Control"],
    goals: ["Success", "Progress"],
    fears: ["Losing control", "Failure"],
    strengths: "As a Director, you excel at taking charge and driving initiatives forward. Your decisive nature and focus on results make you an action-oriented leader who can make things happen quickly. You're not afraid to face challenges head-on and push through obstacles to achieve your goals. Your strength lies in your ability to make tough decisions and maintain momentum, even when others hesitate.",
    development: "Consider developing your Earth Green and Cool Blue energies to complement your action-oriented approach. Take time to consider how your decisions affect others (Earth Green) and analyze situations more thoroughly before acting (Cool Blue). Practice active listening and show appreciation for others' contributions. Remember that taking time for reflection and considering alternative viewpoints doesn't necessarily slow progress—it can lead to more sustainable results."
  },
  "Motivator": {
    name: "Motivator",
    color: "sunshine-yellow",
    dominantColors: ["fiery-red", "sunshine-yellow"],
    description: "Your results show that you have a preference for Fiery Red and Sunshine Yellow energies, making you a Motivator.",
    onGoodDay: ["Assertive", "Dynamic", "Enthusiastic"],
    onBadDay: ["Indiscreet", "Hasty", "Manipulative"],
    likes: ["Adventure", "Unlimited opportunities"],
    goals: ["Prestige", "Respect"],
    fears: ["Being restrained", "Lack of recognition"],
    strengths: "As a Motivator, you excel at energizing others and driving initiatives forward. Your combination of decisiveness and enthusiasm makes you naturally suited to leadership roles where you can inspire action. You're quick to spot opportunities and mobilize resources to pursue them. Your charismatic communication style helps you persuade others and build momentum around your ideas.",
    development: "Consider developing your Earth Green and Cool Blue energies to balance your action-oriented approach. This might include taking more time to listen to others' concerns and build consensus (Earth Green), and bringing more careful analysis to your decision-making (Cool Blue). Remember that sometimes a slower, more methodical approach may yield better results, and that not everyone will match your pace of work or thinking."
  },
  "Inspirer": {
    name: "Inspirer",
    color: "sunshine-yellow",
    dominantColors: ["sunshine-yellow"],
    description: "Your results show that you have a strong preference for Sunshine Yellow energy, making you an Inspirer.",
    onGoodDay: ["Sociable", "Optimistic", "Expressive"],
    onBadDay: ["Unreliable", "Unpredictable", "Too talkative"],
    likes: ["Interaction", "Getting involved"],
    goals: ["Popularity", "Approval"],
    fears: ["Disapproval", "Loneliness"],
    strengths: "As an Inspirer, your greatest strength is your ability to generate enthusiasm and build positive relationships. You naturally connect with others and create an energetic, creative atmosphere. You see possibilities where others see problems and can rally people around a shared vision. Your optimistic outlook and inclusive approach help teams stay motivated through challenges.",
    development: "Consider developing your Cool Blue and Fiery Red energies to complement your people-focused style. Practice more structured approaches to work (Cool Blue) and develop your ability to make tough decisions when necessary (Fiery Red). Try to follow through consistently on commitments, and recognize that sometimes critical analysis and direct feedback are necessary for growth, even if they temporarily disrupt harmony."
  },
  "Helper": {
    name: "Helper",
    color: "sunshine-yellow",
    dominantColors: ["sunshine-yellow", "earth-green"],
    description: "Your results show that you have a preference for Sunshine Yellow and Earth Green energies, making you a Helper.",
    onGoodDay: ["Engaging", "Encouraging", "Empathetic"],
    onBadDay: ["Over-emotional", "Gullible", "Needy"],
    likes: ["Intimacy", "Affection"],
    goals: ["Making a difference", "Connection"],
    fears: ["Isolation", "Rejection"],
    strengths: "As a Helper, you excel at building relationships and bringing positive energy to teams. Your natural empathy combined with your enthusiasm makes you excellent at supporting others and creating an inclusive environment. You're skilled at understanding people's needs and motivations, and can often help resolve interpersonal conflicts. Your ability to connect with others and create harmony is invaluable in collaborative settings.",
    development: "Consider developing your Cool Blue and Fiery Red energies to balance your people-focused approach. This might include practicing more analytical thinking and attention to detail (Cool Blue), and becoming more comfortable with direct confrontation when necessary (Fiery Red). Challenge yourself to make decisions based on objective criteria rather than just relationships, and to set firmer boundaries with others when needed."
  },
  "Supporter": {
    name: "Supporter",
    color: "earth-green",
    dominantColors: ["earth-green"],
    description: "Your results show that you have a strong preference for Earth Green energy, making you a Supporter.",
    onGoodDay: ["Caring", "Cooperative", "Patient"],
    onBadDay: ["Compliant", "Passive", "Stubborn"],
    likes: ["Being of service", "Accommodating others' needs"],
    goals: ["Harmony"],
    fears: ["Change", "Conflict"],
    strengths: "As a Supporter, your greatest strength is your ability to create harmony and ensure everyone's well-being. You're naturally attuned to others' feelings and needs, making you an invaluable team member who helps maintain positive relationships. Your patient, thoughtful approach helps others feel valued and understood. You excel at creating environments where people feel safe to share their thoughts and concerns.",
    development: "Consider developing your Fiery Red and Cool Blue energies to complement your collaborative style. Practice being more assertive when necessary (Fiery Red) and bringing more structured analysis to situations (Cool Blue). Challenge yourself to express disagreement when appropriate and to make decisions that may temporarily disrupt harmony but lead to better outcomes in the long run. Remember that your perspective is valuable, even when it differs from others'."
  },
  "Coordinator": {
    name: "Coordinator",
    color: "cool-blue",
    dominantColors: ["cool-blue", "earth-green"],
    description: "Your results show that you have a preference for Cool Blue and Earth Green energies, making you a Coordinator.",
    onGoodDay: ["Thoughtful", "Diplomatic", "Dependable"],
    onBadDay: ["Anxious", "Withdrawn", "Hesitant"],
    likes: ["Order", "Security"],
    goals: ["Correctness", "Duty"],
    fears: ["Disorder", "Risk"],
    strengths: "As a Coordinator, you excel at creating structure and ensuring processes run smoothly. Your attention to detail combined with your consideration for others makes you a reliable team member who can be counted on to produce high-quality work consistently. You bring organization to complex situations and help maintain stability. Your thoughtful approach and careful planning helps prevent problems before they arise.",
    development: "Consider developing your Fiery Red and Sunshine Yellow energies to complement your methodical approach. This might include practicing more decisive action when necessary (Fiery Red) and exploring more creative, spontaneous approaches (Sunshine Yellow). Challenge yourself to make decisions more quickly at times, even without all the information, and to share your ideas more openly before they're fully formed."
  },
  "Observer": {
    name: "Observer",
    color: "cool-blue",
    dominantColors: ["cool-blue"],
    description: "Your results show that you have a strong preference for Cool Blue energy, making you an Observer.",
    onGoodDay: ["Consistent", "Precise", "Organised"],
    onBadDay: ["Reserved", "Defensive", "Detached"],
    likes: ["Logic", "Facts"],
    goals: ["Understanding", "Objective truth"],
    fears: ["Confusion", "Time pressure"],
    strengths: "As an Observer, your greatest strength is your analytical mind and attention to detail. You excel at critical thinking and thorough analysis, bringing precision and accuracy to your work. Your methodical approach helps identify potential problems and ensures quality outcomes. You're able to remain objective and logical even in challenging situations, making you valuable in complex problem-solving scenarios.",
    development: "Consider developing your Sunshine Yellow and Earth Green energies to complement your analytical style. Practice engaging more spontaneously with others (Sunshine Yellow) and showing more outward empathy in your interactions (Earth Green). Challenge yourself to make decisions without having all the information when necessary, and to express your thoughts and feelings more openly with others."
  }
};

export function getPersonalityType(scores: Record<ColorType, number>): PersonalityType {
  // Find the top two colors
  const sortedColors = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [ColorType, number][];
  
  const dominantColor = sortedColors[0][0];
  const secondaryColor = sortedColors[1][0];
  
  // Match personality type based on dominant and secondary colors
  if ((dominantColor === "fiery-red" && secondaryColor === "cool-blue") || 
      (dominantColor === "cool-blue" && secondaryColor === "fiery-red")) {
    return "Reformer";
  } else if ((dominantColor === "cool-blue" && secondaryColor === "earth-green") || 
             (dominantColor === "earth-green" && secondaryColor === "cool-blue")) {
    return "Coordinator";
  } else if ((dominantColor === "sunshine-yellow" && secondaryColor === "earth-green") || 
             (dominantColor === "earth-green" && secondaryColor === "sunshine-yellow")) {
    return "Helper";
  } else if ((dominantColor === "fiery-red" && secondaryColor === "sunshine-yellow") || 
             (dominantColor === "sunshine-yellow" && secondaryColor === "fiery-red")) {
    return "Motivator";
  } else if (dominantColor === "fiery-red") {
    return "Director";
  } else if (dominantColor === "sunshine-yellow") {
    return "Inspirer";
  } else if (dominantColor === "earth-green") {
    return "Supporter";
  } else {
    return "Observer";
  }
}

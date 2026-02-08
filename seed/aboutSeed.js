const mongoose = require("mongoose");
const AboutPage = require("../models/AboutPage");
require("dotenv").config();

const seedAboutPage = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete existing about pages
    await AboutPage.deleteMany();

    const aboutPageData = {
      agencyInfo: {
        name: "VisionCraft",
        tagline: "We Craft Visual Stories",
        description:
          "Founded in 2015, VisionCraft began as a small studio with a big dream: to revolutionize visual storytelling through cutting-edge technology and artistic vision. Today, we're a globally recognized creative agency specializing in video production, motion design, and digital experiences.",
        foundedYear: 2015,
        mission:
          "Transforming ideas into cinematic experiences through precision editing, motion design, and creative innovation.",
        vision: "To be the world's most innovative visual storytelling agency.",
        values: [
          "Innovation-First Approach",
          "Global Perspective",
          "Sustainability Focus",
          "Cinematic Excellence",
        ],
        heroImage:
          "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=center&q=80",
        socialLinks: [
          {
            platform: "linkedin",
            url: "#",
            icon: "FaLinkedin",
          },
          {
            platform: "twitter",
            url: "#",
            icon: "FaTwitter",
          },
          {
            platform: "instagram",
            url: "#",
            icon: "FaInstagram",
          },
          {
            platform: "facebook",
            url: "#",
            icon: "FaFacebook",
          },
          {
            platform: "youtube",
            url: "#",
            icon: "FaYoutube",
          },
          {
            platform: "behance",
            url: "#",
            icon: "FaBehance",
          },
          {
            platform: "github",
            url: "#",
            icon: "FaGithub",
          },
        ],
        contactEmail: "contact@visioncraft.com",
        contactPhone: "+1 (555) 123-4567",
        address: "123 Creative Street, San Francisco, CA 94107",
        stats: [
          { label: "Projects Completed", value: "500+", icon: "FaVideo" },
          { label: "Happy Clients", value: "200+", icon: "FaSmile" },
          { label: "Team Members", value: "25+", icon: "FaUsers" },
          { label: "Awards Won", value: "50+", icon: "FaAward" },
        ],
      },
      teamMembers: [
        {
          name: "Alex Chen",
          role: "Creative Director",
          front: {
            image:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
            specialty: "Cinematic Storytelling",
            icon: "FaVideo",
          },
          back: {
            quote: "Every frame is a story waiting to be told.",
            bio: "15+ years in film production. Passionate about visual narratives and creative direction.",
            social: [
              { platform: "linkedin", url: "#" },
              { platform: "twitter", url: "#" },
              { platform: "instagram", url: "#" },
            ],
          },
          order: 1,
          isActive: true,
        },
        {
          name: "Maya Rodriguez",
          role: "Lead Video Editor",
          front: {
            image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face",
            specialty: "Color Grading",
            icon: "FaPalette",
          },
          back: {
            quote: "Color is emotion made visible.",
            bio: "Specialized in cinematic color grading and visual effects for 8+ years.",
            social: [
              { platform: "linkedin", url: "#" },
              { platform: "behance", url: "#" },
              { platform: "youtube", url: "#" },
            ],
          },
          order: 2,
          isActive: true,
        },
        // Add more team members...
      ],
      achievements: [
        {
          title: "Best Video Editing Studio 2023",
          description:
            "Recognized as the premier video editing service for exceptional quality and innovative storytelling.",
          year: "2023",
          icon: "FaTrophy",
          image:
            "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&h=400&fit=crop&q=80",
          order: 1,
          isActive: true,
        },
        // Add more achievements...
      ],
      brandLogos: [
        {
          name: "Netflix",
          logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=100&fit=crop&crop=center&q=80",
          website: "https://netflix.com",
          order: 1,
          isActive: true,
        },
        // Add more brand logos...
      ],
      isPublished: true,
    };

    const aboutPage = await AboutPage.create(aboutPageData);

    console.log("About page seeded successfully!");
    console.log(`Created about page with ID: ${aboutPage._id}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding about page:", error);
    process.exit(1);
  }
};

seedAboutPage();

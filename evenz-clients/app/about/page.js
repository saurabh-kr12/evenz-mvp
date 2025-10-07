// app/about/page.js
import AboutUs from "@/pages/AboutPage";

export const metadata = {
  title: "About Evenz.in | Our Mission to Simplify Event Planning in Patna",
  description: "Learn about the story behind Evenz.in, a platform born from a real-life frustration with finding reliable event vendors in Patna. Our mission is to make your event planning effortless.",
};

export default function About() {
  return <AboutUs />;
}
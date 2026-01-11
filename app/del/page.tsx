'use client';
import React from 'react';
export default function DELPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <section className="max-w-3xl mx-auto space-y-8">
          {/* Header Section */}
          <header className="space-y-4 mb-12">
            <div className="inline-block px-4 py-2 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                Digital Engineering Lab
              </p>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">
              DEL – Digital Engineering Lab
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              DEL is an innovative space at Garden City University dedicated to advancing digital technologies, 
              software engineering excellence, and emerging tech solutions. We bring together developers, engineers, 
              and tech enthusiasts to collaborate on cutting-edge projects and build the future of technology.
            </p>
          </header>

          {/* About Section */}
          <section className="space-y-6 py-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">About the Lab</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                The Digital Engineering Lab fosters a culture of innovation and technical excellence. 
                We provide resources, mentorship, and collaborative opportunities for students and professionals 
                to build scalable, impactful software solutions.
              </p>
              <p>
                DEL supports both beginners learning the fundamentals and experienced engineers pushing the boundaries 
                of what's possible in software development, cloud computing, and emerging technologies.
              </p>
            </div>
          </section>

          {/* Activities Section */}
          <section className="space-y-6 py-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">What We Do</h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-4">
                <span className="text-green-600 font-bold mt-1">•</span>
                <span>
                  <strong>Software Development:</strong> Building robust applications using modern frameworks 
                  and best practices in full-stack development.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-green-600 font-bold mt-1">•</span>
                <span>
                  <strong>Cloud & DevOps:</strong> Exploring cloud platforms, containerization, and infrastructure 
                  automation for scalable systems.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-green-600 font-bold mt-1">•</span>
                <span>
                  <strong>Open Source Contributions:</strong> Contributing to and maintaining open-source projects 
                  that benefit the global development community.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-green-600 font-bold mt-1">•</span>
                <span>
                  <strong>Hackathons & Competitions:</strong> Organizing and participating in coding competitions 
                  and innovation challenges.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-green-600 font-bold mt-1">•</span>
                <span>
                  <strong>Technical Workshops:</strong> Hosting hands-on sessions on emerging technologies, 
                  best practices, and industry trends.
                </span>
              </li>
            </ul>
          </section>

          {/* CTA Section */}
          <section className="py-12 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Join Our Community
              </h3>
              <p className="text-gray-700 mb-6">
                Whether you're passionate about software engineering, cloud technologies, or digital innovation, 
                DEL offers opportunities to grow, learn, and contribute. Connect with our team to get involved 
                in our projects and initiatives.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Get in Touch
              </a>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

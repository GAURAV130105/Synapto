import zipfile
import xml.etree.ElementTree as ET
import shutil
import os
import copy
import re

# Namespace map
NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
    'w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
    'w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
    'wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
    'wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
}

# Register all namespaces to preserve them
for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)

# Also register common namespaces that may appear
ET.register_namespace('v', 'urn:schemas-microsoft-com:vml')
ET.register_namespace('o', 'urn:schemas-microsoft-com:office:office')
ET.register_namespace('m', 'http://schemas.openxmlformats.org/officeDocument/2006/math')
ET.register_namespace('wne', 'http://schemas.microsoft.com/office/word/2006/wordml')

def get_paragraph_text(para):
    """Extract full text from a paragraph element."""
    texts = []
    for run in para.findall('.//w:t', NS):
        if run.text:
            texts.append(run.text)
    return ''.join(texts)

def set_paragraph_text(para, new_text):
    """Replace text in a paragraph, keeping formatting of first run."""
    runs = para.findall('.//w:r', NS)
    if not runs:
        return

    # Find first run with text
    first_text_run = None
    for r in runs:
        t = r.find('.//w:t', NS)
        if t is not None and t.text:
            first_text_run = r
            break
    
    if first_text_run is None:
        return

    # Set all text in first text run
    t = first_text_run.find('.//w:t', NS)
    t.text = new_text
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')

    # Clear text from all other runs
    for r in runs:
        if r is first_text_run:
            continue
        for t in r.findall('.//w:t', NS):
            t.text = ''

# ---------------------------------------------------------------------------
# HUMANIZED REPLACEMENTS
# Map: substring of original text -> full replacement text
# We match by a unique substring to avoid issues with whitespace/encoding
# ---------------------------------------------------------------------------

replacements = [
    # === INTRODUCTION PARAGRAPHS ===
    (
        "global educational ecosystem is currently traversing a critical juncture",
        "In the last few years, the way we learn has changed dramatically — almost everything is going digital. But while technology has moved fast, making that technology truly accessible for everyone hasn't kept up. According to the WHO (2023), over 16 percent of people worldwide — that's more than a billion — live with some form of disability. For many of these individuals, digital tools aren't just helpful; they're essential for being able to learn and participate in today's world."
    ),
    (
        "Education is often described as the most powerful tool for personal growth",
        "Education has always been one of the strongest tools for personal growth and upward mobility. With the rise of online learning platforms, students now have access to courses, video lectures, and digital textbooks from virtually anywhere. But for all the progress that's been made, students with disabilities are still frequently left behind when it comes to accessing online educational content."
    ),
    (
        "For example, a deaf student watching an online lecture may struggle",
        "Think about a student who is deaf, trying to follow an online lecture — without sign language support, subtitles alone may not be enough, since sign languages have entirely different grammar from spoken languages. Or consider a student who is visually impaired encountering a chart or diagram with no text alternative — a screen reader simply can't describe what isn't labeled. Students with dyslexia or other cognitive learning differences might also find it hard to work through dense academic language or stay engaged with content that wasn't designed with them in mind."
    ),
    (
        "While many modern learning platforms provide features such as subtitles or transcripts",
        "Many platforms today do offer some accessibility features — things like subtitles, transcripts, or high-contrast modes. But more often than not, these are tacked on as afterthoughts rather than built into the platform from the ground up. This means that a lot of learners are still stuck with environments that don't truly accommodate their needs."
    ),
    (
        "This project introduces Synapto, an AIpowered inclusive education platform",
        "This is where our project, Synapto, comes in. Synapto is an AI-powered inclusive education platform built on a simple but important idea: instead of asking students to adjust to the system, the system should adjust to the student. It uses technologies like artificial intelligence, natural language processing, and 3D avatar animation to convert educational content into formats that different learners can actually use."
    ),
    (
        "Through features such as sign language avatars for deaf learners",
        "Some of the main features include sign language avatars for deaf and hard-of-hearing users, audio narration for those with visual impairments, text simplification for students who struggle with complex reading material, and distraction-free focus modes for neurodivergent learners. The goal is to make the entire learning experience more inclusive."
    ),
    (
        "The ultimate goal of this project is to demonstrate how intelligent technology",
        "Ultimately, what we want to show through this project is that smart use of technology can genuinely help break down barriers in education — so that learning opportunities aren't limited by a person's abilities."
    ),
    (
        "However, persistent challenges in digital readiness",
        "That said, real-world challenges remain. Issues like poor digital infrastructure, lack of awareness, and the high cost of specialized accessibility tools continue to create gaps that put vulnerable learners at a disadvantage."
    ),
    (
        "The Synapto project is conceptualized as a comprehensive",
        "Synapto is designed as a practical, AI-driven learning platform that tackles these barriers head-on by making accessibility a core part of the educational experience rather than an optional add-on."
    ),

    # === LITERATURE REVIEW ===
    (
        "Several research studies and platforms have attempted to address accessibility in digital education.",
        "There has been a fair amount of work done in the area of accessibility in digital education, both in research and on commercial platforms."
    ),
    (
        "Online learning platforms such as Coursera, Udemy, and Khan Academy provide subtitles",
        "Platforms like Coursera, Udemy, and Khan Academy do offer subtitles and transcripts, which is a step in the right direction. But these features are mostly static — they don't adapt the content based on a learner's specific cognitive or sensory needs."
    ),
    (
        "Research in assistive technologies has explored sign language avatars",
        "On the research side, there have been projects exploring the use of sign language avatars — essentially animated characters that translate text into sign language. JASigning is one well-known example that showed this approach can actually work. The problem is, most of these systems exist as standalone research prototypes and haven't been brought into mainstream education platforms."
    ),
    (
        "Other studies focus on text simplification using Natural Language Processing",
        "There's also been work on using NLP-based text simplification to help learners with dyslexia or cognitive difficulties make sense of complex material. Text-to-speech tools and screen readers have also improved over the years for visually impaired users."
    ),
    (
        "Despite these advancements, most solutions focus on singledisability support",
        "But the common thread across most of these solutions is that they tend to focus on one type of disability at a time. There isn't really a unified platform out there that brings together multiple accessibility tools and adapts content dynamically."
    ),
    (
        "Therefore, there is a need for a system that integrates multiple accessibility technologies",
        "This gap is exactly what motivated us to build Synapto — a single platform that combines several accessibility technologies and adapts educational content in real time depending on who is using it."
    ),

    # === PROBLEM STATEMENT ===
    (
        "Despite the theoretical promise of digital learning, several critical barriers prevent the realization of a truly inclusive educational landscape.",
        "While digital learning has a lot of potential, there are still some serious barriers standing in the way of making it truly inclusive for all students."
    ),
    (
        "A significant portion of the student population remains excluded due to socio-economic factors",
        "A large number of students are still shut out simply because of socio-economic factors. In the United States, for instance, around 15% of households with school-age children don't have reliable high-speed internet — and this number is much worse in low-income and rural areas. On top of that, premium AI-based accessibility tools can cost up to $1,000 a year, and about 50% of colleges and universities don't provide institution-wide licenses for them. So the technology that's supposed to level the playing field can actually end up making things more unequal for low-income students with disabilities."
    ),
    (
        "Most existing Learning Management Systems (LMS) were designed for a neurotypical",
        "Most of the Learning Management Systems (LMS) that schools and universities use today were built with a neurotypical, able-bodied user in mind. Accessibility features are usually bolted on later as a compliance requirement, not baked in from the start. There are some specific shortcomings worth noting:"
    ),
    (
        "Lack of Native Sign Language Support: Current platforms rely on subtitles",
        "No built-in sign language support: Platforms typically offer subtitles as a substitute, but for students whose primary language is a sign language — which has a completely different grammatical structure from spoken language — subtitles often fall short."
    ),
    (
        "Inadequate Neurodiverse Considerations: Rigid course structures and distracting UI elements",
        "Poor support for neurodivergent learners: Things like cluttered interfaces, animations, and rigid course layouts can cause sensory overload or increase anxiety for students with ADHD or autism."
    ),
    (
        'The "Resolution Gap": While automated accessibility checkers can surface basic errors',
        'The \"resolution gap\": Automated accessibility checkers can catch basic errors, but they frequently miss deeper usability issues that only come to light through hands-on expert testing or real user feedback.'
    ),
    (
        "Students with learning disabilities (LD) report spending more hours studying",
        "Students with learning disabilities often end up spending more hours studying than their peers but still rate their own academic ability lower — which can create a discouraging cycle of frustration and self-doubt. Online courses in general tend to have a failure rate that's 10–20% higher than traditional in-person classes, and dropout rates in online modules can range from 40% to 80%. During the pandemic, when everything moved online suddenly, 67% of special education administrators said they faced major challenges keeping up with IEP requirements in virtual settings."
    ),

    # === OBJECTIVES ===
    (
        "The Synapto project is defined by a set of clear technical, pedagogical, and compliance-oriented goals.",
        "The objectives of Synapto can be broken down into what we want to achieve technically and what we want to achieve for learners."
    ),
    (
        "Integrated Multi-Modal Engine: To develop a unified AI pipeline that converts spoken or written text into photorealistic 3D sign language",
        "Multi-modal content engine: Build an AI pipeline that can take spoken or written text and convert it into 3D sign language animations, making content accessible in multiple formats through a single system."
    ),
    (
        "Dynamic UI Adaptation: To implement a real-time",
        'Adaptive user interface: Create a system that adjusts the interface in real time — things like layout complexity, color contrast, and navigation style — based on each user\'s profile and how they interact with the platform.'
    ),
    (
        "Executive Function Scaffolding: To provide neurodivergent students",
        "Support for executive function: Give neurodivergent students structured guidance and scaffolding"
    ),
    (
        "Autonomy and Agency: To empower learners to customize their own sensory environments",
        "Learner autonomy: Let users personalize their own learning environment"
    ),

    # === METHODOLOGY ===
    (
        "The proposed system will follow a modular architecture consisting of the following components:",
        "We plan to build Synapto using a modular architecture. Here's a breakdown of the main components:"
    ),
    (
        "The platform will allow users to upload educational materials such as:",
        "Users will be able to upload educational materials in several formats:"
    ),
    (
        "These inputs will be processed and stored in a database.",
        "Once uploaded, these will be processed and stored in the database for further use."
    ),
    (
        "The AI engine will analyze and transform the content using:",
        "The AI engine will handle content analysis and transformation using:"
    ),
    (
        "A 3D avatar will be created using tools such as Ready Player Me, Mixamo, and Blender.The avatar will display sign language gestures corresponding to the processed text.",
        "We'll create a 3D avatar using Ready Player Me, Mixamo, and Blender. This avatar will perform sign language gestures that match the processed text content."
    ),
    (
        "The system will provide accessibility features including:",
        "The interface will include several accessibility options:"
    ),
    (
        "The platform will be developed using modern web technologies:",
        "For the tech stack, we're using:"
    ),

    # === EXPECTED OUTCOMES ===
    (
        "The expected outcomes of this project include:",
        "Here's what we expect to achieve by the end of this project:"
    ),
    (
        "Development of an AI-powered inclusive learning platform.",
        "A working AI-powered inclusive learning platform."
    ),
    (
        "Implementation of a 3D sign language avatar system capable of translating text into sign gestures.",
        "A functional 3D sign language avatar that can translate text into sign language gestures."
    ),
    (
        "Integration of text simplification and audio narration tools for improved accessibility.",
        "Text simplification and audio narration features integrated into the platform to improve accessibility."
    ),
    (
        "Creation of a user-friendly web application that adapts educational content for diverse learners.",
        "A user-friendly web app that can adapt educational content for learners with different needs."
    ),
    (
        "Improvement in accessibility and learning comprehension for students with disabilities.",
        "Measurable improvements in accessibility and learning comprehension for students with disabilities."
    ),
    (
        "The system will demonstrate how AI and interactive technologies can be used to make digital education more inclusive and adaptive.",
        "Through this project, we aim to show that AI and interactive technologies can meaningfully improve digital education by making it more inclusive and responsive to individual needs."
    ),
]


def main():
    src = 'synopsis.docx'
    dst = 'synopsis_humanized.docx'

    # Copy original
    shutil.copy2(src, dst)

    # Read and parse
    with zipfile.ZipFile(dst, 'r') as zin:
        # Read all files
        file_contents = {}
        for name in zin.namelist():
            file_contents[name] = zin.read(name)

    # Parse document.xml
    doc_xml = file_contents['word/document.xml']
    root = ET.fromstring(doc_xml)

    # Get all paragraphs
    body = root.find('.//w:body', NS)
    paragraphs = body.findall('.//w:p', NS)

    replaced_count = 0
    for para in paragraphs:
        para_text = get_paragraph_text(para)
        if not para_text.strip():
            continue

        for (old_substr, new_text) in replacements:
            if old_substr in para_text:
                set_paragraph_text(para, new_text)
                replaced_count += 1
                break

    print(f"Replaced {replaced_count} paragraphs")

    # Write back
    new_xml = ET.tostring(root, encoding='unicode', xml_declaration=False)
    # Add XML declaration
    new_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + new_xml

    file_contents['word/document.xml'] = new_xml.encode('utf-8')

    # Write new zip
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for name, data in file_contents.items():
            zout.writestr(name, data)

    print(f"Humanized synopsis saved to: {dst}")


if __name__ == '__main__':
    main()

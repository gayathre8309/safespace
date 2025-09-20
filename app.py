# app.py
import streamlit as st
import google.generativeai as genai
import pandas as pd
from datetime import datetime, timedelta

# --- Page Configuration ---
# Must be the first Streamlit command in your script
st.set_page_config(
    page_title="SafeSpace+",
    page_icon="🛡️",
    layout="centered",
    initial_sidebar_state="auto",
)

# --- Gemini API Configuration ---
# Load API key from Streamlit's secrets management
try:
    api_key = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=api_key)
except (KeyError, FileNotFoundError):
    st.error("Gemini API Key not found. Please add it to your `.streamlit/secrets.toml` file.")
    st.stop()


# --- Re-implementation of Gemini Service ---
def analyze_message_gemini(message: str):
    """
    Analyzes a message using the Gemini API to detect harmful content.
    This is the Python equivalent of the services/geminiService.ts file.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_instruction = "You are a cyberbullying detection expert. Analyze the user's text for harmful content like bullying, hate speech, or threats. Respond ONLY with the requested JSON object. Your analysis should be swift and accurate to protect users."
        
        analysis_schema = {
            "type": "object",
            "properties": {
                "isHarmful": {
                    "type": "boolean",
                    "description": "Is the text harmful, containing cyberbullying, hate speech, or threats?"
                },
                "severity": {
                    "type": "string",
                    "description": "The severity of the harmful content. Can be 'Low', 'Medium', or 'High'. Returns 'Low' if not harmful.",
                    "enum": ["Low", "Medium", "High"]
                },
                "suggestion": {
                    "type": "string",
                    "description": "A constructive suggestion to rephrase the message kindly, or an empty string if not harmful."
                }
            },
            "required": ["isHarmful", "severity", "suggestion"]
        }

        response = model.generate_content(
            f"Analyze this text: \"{message}\"",
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": analysis_schema,
                "temperature": 0.1
            },
            system_instruction=system_instruction
        )
        
        # The API returns a Python dict directly when a schema is used
        return response.text if isinstance(response.text, dict) else eval(response.text)

    except Exception as e:
        st.error(f"Error analyzing message with Gemini API: {e}")
        # Fallback response on error
        return {
            "isHarmful": False,
            "severity": 'Low',
            "suggestion": ''
        }

# --- Mock Data and Session State Initialization ---
# This is Streamlit's way of managing state, similar to React's Context
def initialize_state():
    if 'logged_in' not in st.session_state:
        st.session_state.logged_in = False
    if 'user' not in st.session_state:
        st.session_state.user = None
    if 'flagged_content' not in st.session_state:
        st.session_state.flagged_content = []
    if 'alert_threshold' not in st.session_state:
        st.session_state.alert_threshold = 'Medium'

# --- UI Components and Pages (Re-implementing React components as Python functions) ---

def show_logo():
    st.markdown("""
        <style>
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .logo-text {
            font-size: 2em;
            font-weight: bold;
            color: #334155; /* slate-700 */
        }
        </style>
        <div class="logo-container">
            <span style="font-size: 2.5em;">🛡️</span>
            <span class="logo-text">SafeSpace+</span>
        </div>
    """, unsafe_allow_html=True)

def login_page():
    """Renders the login screen."""
    show_logo()
    st.subheader("Welcome Back")
    st.caption("Sign in to continue to your SafeSpace.")
    st.info("Demo: use 'child@test.com' or 'parent@test.com'")
    
    with st.form("login_form"):
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_password")
        submitted = st.form_submit_button("Sign In", type="primary", use_container_width=True)

        if submitted:
            if not email or not password:
                st.error("Please fill in all fields.")
            else:
                # Mock login logic
                if 'parent' in email:
                    role = 'Parent'
                    user = {'name': 'Dr. Riley', 'email': email, 'role': role, 'childName': 'Alex'}
                    # Populate with mock data for parent
                    now = datetime.now()
                    st.session_state.flagged_content = [
                        {'id': 1, 'text': 'You are so dumb.', 'sourceApp': 'WhatsApp', 'severity': 'Medium', 'timestamp': now - timedelta(minutes=2), 'notes': ''},
                        {'id': 2, 'text': "I'm going to find you after school.", 'sourceApp': 'Instagram', 'severity': 'High', 'timestamp': now - timedelta(minutes=10), 'notes': "Spoke with Alex about this. He said it was a misunderstanding."},
                        {'id': 3, 'text': 'Nobody likes you.', 'sourceApp': 'Messenger', 'severity': 'Medium', 'timestamp': now - timedelta(days=7)},
                    ]
                else:
                    role = 'Child'
                    user = {'name': 'Alex', 'email': email, 'role': role}
                    st.session_state.flagged_content = []

                st.session_state.user = user
                st.session_state.logged_in = True
                st.rerun()

def parent_dashboard():
    """Renders the Parent Dashboard."""
    st.title("Parent Dashboard")
    st.write("Review flagged messages, manage alerts, and track incidents.")

    user = st.session_state.user
    
    # Parent Details Card
    with st.container(border=True):
        st.subheader("Parent Details")
        st.markdown(f"""
        - **Guardian:** {user['name']}
        - **Email:** {user['email']}
        - **Monitoring:** Child Account for **{user['childName']}**
        """)

    # Weekly Summary Chart
    with st.container(border=True):
        st.subheader("Weekly Summary")
        # Create mock data for the chart
        chart_data = pd.DataFrame({
            'week': ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
            'incidents': [1, 3, 2, len([c for c in st.session_state.flagged_content if c['timestamp'] > datetime.now() - timedelta(weeks=1)])]
        })
        st.bar_chart(chart_data.set_index('week'))

    # Alert Settings
    with st.container(border=True):
        st.subheader("Alert Settings")
        st.write("Notify me for:")
        threshold_options = ['Medium & High Severity', 'High Severity Only']
        current_selection = 0 if st.session_state.alert_threshold == 'Medium' else 1
        
        selected = st.radio(
            "Alert Level", 
            threshold_options, 
            index=current_selection, 
            label_visibility="collapsed",
            horizontal=True
        )

        st.session_state.alert_threshold = 'Medium' if selected == threshold_options[0] else 'High'

    # Flagged Content Log
    st.subheader("Flagged Content Log")
    
    filtered_content = [
        c for c in st.session_state.flagged_content 
        if c['severity'] == 'High' or st.session_state.alert_threshold == 'Medium'
    ]

    if not filtered_content:
        st.success("🎉 No content to report based on your settings. Everything seems safe!")
    else:
        for content in sorted(filtered_content, key=lambda x: x['timestamp'], reverse=True):
            with st.expander(f"**{content['sourceApp']}** - *{content['severity']}* - {content['timestamp'].strftime('%Y-%m-%d %H:%M')}"):
                st.markdown(f"> \"{content['text']}\"")
                
                # Notes section
                note_key = f"note_{content['id']}"
                current_note = content.get('notes', '')
                new_note = st.text_area("Private Notes", value=current_note, key=note_key, placeholder="Add notes about this incident...")
                
                if st.button("Save Note", key=f"save_{content['id']}"):
                    # Find the content item and update its notes
                    for item in st.session_state.flagged_content:
                        if item['id'] == content['id']:
                            item['notes'] = new_note
                            break
                    st.toast("Note saved!")
                    st.rerun()


def monitoring_screen():
    """Renders the Child's Monitoring Screen."""
    st.title("Cross-App Monitor")
    st.write("Paste a message from any app to check if it's safe before you send, or to understand if something you received is harmful.")
    
    with st.container(border=True):
        text_to_analyze = st.text_area("Message to Analyze", placeholder="Paste message text here...", height=100)
        source_app = st.selectbox("App Source", ['WhatsApp', 'Instagram', 'Messenger', 'TikTok', 'Telegram', 'Other'])
        
        if st.button("Analyze Text", type="primary", use_container_width=True, disabled=not text_to_analyze):
            with st.spinner("Analyzing message..."):
                result = analyze_message_gemini(text_to_analyze)
                st.session_state.last_analysis = result
                st.session_state.last_text = text_to_analyze
                st.session_state.last_source = source_app

    if 'last_analysis' in st.session_state and st.session_state.last_analysis:
        result = st.session_state.last_analysis
        if result['isHarmful']:
            st.warning("**Analysis Result: Potentially Harmful**")
            st.info(f"**Suggestion:** \"{result['suggestion']}\"")
            if st.button("Log Incident for Parent", use_container_width=True):
                new_incident = {
                    'id': len(st.session_state.flagged_content) + 1,
                    'text': st.session_state.last_text,
                    'sourceApp': st.session_state.last_source,
                    'severity': result['severity'],
                    'timestamp': datetime.now()
                }
                # In a real app, this would be saved to a database.
                # Here, we just show a success message for the demo.
                st.success("Incident logged. Your parent/guardian has been notified.")
                # We can clear the analysis to hide the buttons
                del st.session_state.last_analysis 
                st.rerun()

        else:
            st.success("**Analysis Result: Looks Okay!**")
            st.write("Our AI didn't detect any harmful content in this message. Thanks for checking!")

def mood_tracker_page():
    st.title("😊 Mood Tracker")
    st.write("How are you feeling today?")
    # Simple implementation using radio buttons
    mood = st.radio(
        "Select your mood:",
        ['😄 Happy', '🙂 Okay', '😢 Sad', '😠 Angry', '😟 Anxious'],
        horizontal=True
    )
    if st.button("Log Mood", type="primary"):
        st.toast(f"Thanks for logging your mood! You're feeling: {mood}")
        if any(m in mood for m in ['Sad', 'Angry', 'Anxious']):
            st.info("It's brave to share how you feel. Remember, it's okay not to be okay. Help is always available if you need to talk to someone.")

def safe_circles_page():
    st.title("🤝 Safe Circles")
    st.write("Connect and chat securely with your trusted groups.")
    st.info("This feature is a visual demonstration in this version of the app.")
    
    circles = [
        {'name': 'Family', 'members': 5, 'icon': '👨‍👩‍👧‍👦'},
        {'name': 'Basketball Team', 'members': 12, 'icon': '🏀'},
        {'name': 'Class 7B', 'members': 25, 'icon': '📚'},
        {'name': 'Close Friends', 'members': 8, 'icon': '🌟'},
    ]
    
    for circle in circles:
        with st.container(border=True):
            col1, col2 = st.columns([1, 4])
            with col1:
                st.header(circle['icon'])
            with col2:
                st.subheader(circle['name'])
                st.caption(f"{circle['members']} members")


# --- Main Application Logic ---

initialize_state()

if not st.session_state.logged_in:
    login_page()
else:
    # --- Sidebar for Navigation ---
    with st.sidebar:
        user = st.session_state.user
        st.write(f"Welcome, **{user['name']}**")
        st.divider()

        if user['role'] == 'Parent':
            page = st.radio("Navigation", ["Dashboard"], label_visibility="collapsed")
        else: # Child
            page = st.radio("Navigation", ["Monitor", "Mood Tracker", "Safe Circles"], label_visibility="collapsed")
        
        if st.button("Sign Out"):
            # Clear session state on logout
            for key in st.session_state.keys():
                del st.session_state[key]
            st.rerun()

    # --- Page Routing ---
    if user['role'] == 'Parent':
        parent_dashboard()
    else: # Child
        if page == "Monitor":
            monitoring_screen()
        elif page == "Mood Tracker":
            mood_tracker_page()
        elif page == "Safe Circles":
            safe_circles_page()
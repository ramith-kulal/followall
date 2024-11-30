import React, { useState, useEffect } from 'react';
import "./App.css"
const App = () => {
    const [isAutomationRunning, setIsAutomationRunning] = useState(false);

    useEffect(() => {
        console.log("App loaded: Ready to automate.");

        return () => {
            // Cleanup when component unmounts (if needed)
            console.log("Cleanup performed");
        };
    }, []);

    const startAutomation = async () => {
        setIsAutomationRunning(true);
        console.log("Starting automation...");

        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.id !== undefined) {
            console.log('Active tab found:', tab);

            // Execute the automation code in the page context
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: automateFollowProcess, // Function to run in the page context
                },
                (injectionResults) => {
                    if (injectionResults && injectionResults.length > 0) {
                        console.log('Automation initiated.');
                    } else {
                        console.error('Failed to execute content script.');
                    }
                }
            );
        } else {
            console.error('No active tab found.');
        }
    };

    const automateFollowProcess = async () => {
        console.log('Running automation in the page context...');

        const switchToForYouTab = async () => {
            console.log("Attempting to find the 'For You' tab/button...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DOM updates

            const forYouTab = Array.from(document.querySelectorAll('div')).find(
                el => el.textContent?.trim() === "For you" && el instanceof HTMLElement
            );

            if (forYouTab) {
                console.log('Found For You Tab:', forYouTab);

                const innerTab = forYouTab.querySelector('span') || forYouTab; 
                if (innerTab instanceof HTMLElement) {
                    innerTab.click();
                    console.log('For You tab clicked.');
                } else {
                    console.error('Inner tab element not found.');
                }

                await new Promise(resolve => setTimeout(resolve, 5000)); 
            } else {
                console.error('For You tab not found.');
            }
        };

        await switchToForYouTab();

        const simulateHover = (element) => {
            console.log('Hovering over element...');
            const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true, cancelable: true });
            const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
            element.dispatchEvent(mouseEnterEvent);
            element.dispatchEvent(mouseOverEvent);
        };

        const clickFollowButton = async (icon) => {
            console.log('Hovering over the icon to show the popup...');
            simulateHover(icon); 

            await new Promise(resolve => setTimeout(resolve, 1000));

            const followButton = document.querySelector('button[aria-label^="Follow"]');
            if (followButton) {
                console.log('Follow button found:', followButton);

                if (followButton.offsetParent !== null && followButton.textContent.trim() === 'Follow') {
                    followButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    followButton.click();
                    console.log('Follow button clicked.');
                } else {
                    console.log('Already followed or Follow button not visible.');
                }
            } else {
                console.error('Follow button not found.');
            }

            icon.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 5000));
        };

        const scrollToElementIfNeeded = (element) => {
            const rect = element.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                console.log('Scrolling to element...');
                window.scrollBy({
                    top: rect.top + window.scrollY - 100,
                    left: 0,
                    behavior: 'smooth',
                });
            }
        };

        const processIcons = async () => {
            console.log('Finding icons in the feed...');
            const icons = document.querySelectorAll('div[data-testid^="UserAvatar-Container"]');

            if (!icons.length) {
                console.error('No icons found in the feed.');
                return;
            }

            let processedUsers = 0;
            const totalUsers = icons.length;

            for (const icon of icons) {
                console.log('Processing icon:', icon);

                scrollToElementIfNeeded(icon);

                const followButton = icon.querySelector('button[aria-label^="Follow"]');
                if (followButton && followButton.textContent.trim() === 'Following') {
                    console.log('Already following this user, skipping.');
                    continue;
                }

                await clickFollowButton(icon);

                processedUsers++;

                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            if (processedUsers === totalUsers) {
                console.log('All users processed, scrolling down...');
                window.scrollBy({
                    top: window.i,
                    left: 0,
                    behavior: 'smooth',
                });

                await new Promise(resolve => setTimeout(resolve, 5000));
                processIcons();
            }
        };

        await processIcons();
    };

    return (
        <div>
            <button
                onClick={startAutomation}
                className={`fixed bottom-10 right-10 p-4 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform ${isAutomationRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} hover:scale-105`}
                disabled={isAutomationRunning}
            >
                {isAutomationRunning ? 'Running...' : 'Start Following'}
            </button>
        </div>
    );
};

export default App;

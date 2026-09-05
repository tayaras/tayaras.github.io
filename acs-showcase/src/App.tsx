import { useCallback, useMemo, useState } from 'react';
import {
  CameraButton,
  CaptionsBanner,
  ControlBar,
  ControlBarButton,
  EndCallButton,
  FluentThemeProvider,
  MicrophoneButton,
  RealTimeTextModal,
  ScreenShareButton,
  StartRealTimeTextButton,
  VideoGallery,
  darkTheme,
  lightTheme,
  type ChatMessage,
  type OptionsDevice,
  type SystemMessage,
  type VideoGalleryLocalParticipant,
} from '@azure/communication-react';
import { ChatPanel } from './components/ChatPanel';
import { LOCAL_DISPLAY_NAME, LOCAL_USER_ID, SEED_PARTICIPANTS, buildRemoteParticipants } from './data/participants';
import { SEED_MESSAGES } from './data/messages';
import { useLocalCamera } from './hooks/useLocalCamera';
import { useMediaDevices } from './hooks/useMediaDevices';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useHostTheme } from './hooks/useHostTheme';
import { useRealTimeTextFeed } from './hooks/useRealTimeTextFeed';

const ChatIcon = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M10 2.5a7.5 7.5 0 0 1 6.6 11.05l.85 3.02a.75.75 0 0 1-.94.92l-3.1-.9A7.5 7.5 0 1 1 10 2.5Zm0 1.5a6 6 0 1 0 2.94 11.23.75.75 0 0 1 .58-.07l2.06.6-.57-2.02a.75.75 0 0 1 .07-.57A6 6 0 0 0 10 4Z"
      fill="currentColor"
    />
  </svg>
);

const ThemeIcon = ({ isDark }: { isDark: boolean }): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    {isDark ? (
      <path
        d="M7.5 2.7a.75.75 0 0 1 .3.95A6 6 0 0 0 16.35 12.2a.75.75 0 0 1 1.04.9A7.5 7.5 0 1 1 6.6 2.6a.75.75 0 0 1 .9.1Z"
        fill="currentColor"
      />
    ) : (
      <path
        d="M10 4.5a.75.75 0 0 1-.75-.75V2.5a.75.75 0 0 1 1.5 0v1.25A.75.75 0 0 1 10 4.5Zm0 11a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0v-1.25A.75.75 0 0 1 10 15.5ZM14.5 10a.75.75 0 0 1 .75-.75h1.25a.75.75 0 0 1 0 1.5H15.25A.75.75 0 0 1 14.5 10Zm-11.25-.75H4.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1 0-1.5ZM10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
        fill="currentColor"
      />
    )}
  </svg>
);

export const App = (): JSX.Element => {
  // Below this width the five control-bar buttons no longer fit with their labels,
  // and their default 3.5rem minimum still overflows a 320px viewport.
  const isNarrow = useMediaQuery('(max-width: 26rem)');
  const controlButtonStyles = isNarrow
    ? { root: { minWidth: '2.5rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' } }
    : undefined;
  const [isDark, setIsDark] = useHostTheme();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
  const [messages, setMessages] = useState<(ChatMessage | SystemMessage)[]>(SEED_MESSAGES);

  const [isRttOn, setIsRttOn] = useState(false);
  const [showRttModal, setShowRttModal] = useState(false);
  const feed = useRealTimeTextFeed(isRttOn);

  const { cameras, microphones, refresh } = useMediaDevices();
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string | undefined>();

  const camera = useLocalCamera(selectedCameraId, refresh);
  const isCameraOn = camera.status === 'on';

  const remoteParticipants = useMemo(() => buildRemoteParticipants(SEED_PARTICIPANTS, isDark), [isDark]);


  const localParticipant: VideoGalleryLocalParticipant = useMemo(
    () => ({
      userId: LOCAL_USER_ID,
      displayName: LOCAL_DISPLAY_NAME,
      isMuted: !isMicOn,
      isScreenSharingOn: isScreenSharing,
      videoStream:
        isCameraOn && camera.videoElement
          ? { isAvailable: true, isMirrored: true, renderElement: camera.videoElement }
          : { isAvailable: false },
    }),
    [camera.videoElement, isCameraOn, isMicOn, isScreenSharing]
  );

  const selectedCamera = useMemo(
    () => cameras.find((device) => device.id === selectedCameraId) ?? cameras[0],
    [cameras, selectedCameraId]
  );
  const selectedMicrophone = useMemo(
    () => microphones.find((device) => device.id === selectedMicrophoneId) ?? microphones[0],
    [microphones, selectedMicrophoneId]
  );

  const onSelectCamera = useCallback(async (device: OptionsDevice) => {
    setSelectedCameraId(device.id);
  }, []);
  const onSelectMicrophone = useCallback(async (device: OptionsDevice) => {
    setSelectedMicrophoneId(device.id);
  }, []);

  const onToggleCamera = useCallback(async () => {
    await camera.toggle();
  }, [camera]);

  const onToggleMicrophone = useCallback(async () => {
    setIsMicOn((on) => !on);
  }, []);

  const onToggleScreenShare = useCallback(async () => {
    setIsScreenSharing((on) => !on);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((open) => !open);
  }, []);

  const onSendMessage = useCallback((content: string) => {
    setMessages((previous) => [
      ...previous,
      {
        messageType: 'chat',
        messageId: `local-${Date.now()}`,
        contentType: 'text',
        senderId: LOCAL_USER_ID,
        senderDisplayName: LOCAL_DISPLAY_NAME,
        content,
        createdOn: new Date(),
        mine: true,
        attached: false,
        status: 'seen',
      },
    ]);
  }, []);

  // The only time we take over local tile rendering: getUserMedia said no, and the
  // visitor needs to be told so where they were looking. VideoTile's own placeholder
  // and overlay slots collapse to zero height, so the tile is drawn directly here.
  const renderLocalTileWithError = useCallback(
    () => (
      <div className="camera-error">
        <span className="camera-error__title">{camera.errorSummary}</span>
        <span className="camera-error__body">{LOCAL_DISPLAY_NAME}</span>
      </div>
    ),
    [camera.errorSummary]
  );

  const hasCameraError = camera.status === 'denied' || camera.status === 'error';

  if (hasLeft) {
    return (
      <FluentThemeProvider fluentTheme={isDark ? darkTheme : lightTheme}>
        <div className={`app app--ended ${isDark ? 'app--dark' : ''}`}>
          <div className="ended-card">
            <h1 className="ended-card__title">You left the call</h1>
            <p className="ended-card__body">
              Nothing was ever connected &mdash; this is a UI showcase built from the Azure Communication
              Services UI Library components.
            </p>
            <button type="button" className="ended-card__button" onClick={() => setHasLeft(false)}>
              Rejoin
            </button>
          </div>
        </div>
      </FluentThemeProvider>
    );
  }

  return (
    <FluentThemeProvider fluentTheme={isDark ? darkTheme : lightTheme}>
      <div className={`app ${isDark ? 'app--dark' : ''}`}>
        <header className="app__header">
          <div className="app__heading">
            <h1 className="app__title">Design review &mdash; call surface</h1>
            <p className="app__subtitle">7 participants &middot; UI showcase, not a live call</p>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            aria-pressed={isDark}
          >
            <ThemeIcon isDark={isDark} />
            <span>{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </header>

        <div className={`app__body ${isChatOpen ? 'app__body--chat-open' : ''}`}>
          <main className="stage" aria-label="Video gallery">
            <VideoGallery
              layout="floatingLocalVideo"
              localParticipant={localParticipant}
              remoteParticipants={remoteParticipants}
              dominantSpeakers={['p-nadia']}
              showMuteIndicator
              remoteVideoTileMenu={false}
              onRenderLocalVideoTile={hasCameraError ? renderLocalTileWithError : undefined}
            />
            {isRttOn && (
              <div className="stage__banner">
                <CaptionsBanner
                  captions={[]}
                  realTimeTexts={{
                    completedMessages: feed.completedRtt,
                    currentInProgress: feed.inProgressRtt,
                    myInProgress: feed.myRtt,
                  }}
                  isRealTimeTextOn={isRttOn}
                  onSendRealTimeText={isRttOn ? feed.sendMyRtt : undefined}
                  latestLocalRealTimeText={feed.myRtt}
                  captionsOptions={{ height: 'default' }}
                />
              </div>
            )}
          </main>

          {isChatOpen && <ChatPanel messages={messages} onSend={onSendMessage} onClose={toggleChat} />}
        </div>

        {hasCameraError && (
          <div className="camera-notice" role="status">
            {camera.errorMessage}
          </div>
        )}

        <div className="app__controls">
          <ControlBar layout="floatingBottom">
            <CameraButton
              checked={isCameraOn}
              disabled={camera.status === 'starting'}
              onToggleCamera={onToggleCamera}
              cameras={cameras}
              selectedCamera={selectedCamera}
              onSelectCamera={onSelectCamera}
              enableDeviceSelectionMenu
              showLabel={!isNarrow}
              styles={controlButtonStyles}
            />
            <MicrophoneButton
              checked={isMicOn}
              onToggleMicrophone={onToggleMicrophone}
              microphones={microphones}
              selectedMicrophone={selectedMicrophone}
              onSelectMicrophone={onSelectMicrophone}
              enableDeviceSelectionMenu
              showLabel={!isNarrow}
              styles={controlButtonStyles}
            />
            <ScreenShareButton
              checked={isScreenSharing}
              onToggleScreenShare={onToggleScreenShare}
              showLabel={!isNarrow}
              styles={controlButtonStyles}
            />
            <StartRealTimeTextButton
              showLabel={!isNarrow}
              styles={controlButtonStyles}
              isRealTimeTextOn={isRttOn}
              // Consent first: once RTT is on it is on for everyone, for the rest
              // of the call, which is what the modal says in those words.
              onStartRealTimeText={() => setShowRttModal(true)}
            />
            <ControlBarButton
              checked={isChatOpen}
              onClick={toggleChat}
              showLabel={!isNarrow}
              labelKey="showcase-chat-button"
              styles={controlButtonStyles}
              strings={{ label: 'Chat', tooltipContent: isChatOpen ? 'Hide chat' : 'Show chat' }}
              onRenderIcon={() => <ChatIcon />}
              ariaLabel={isChatOpen ? 'Hide chat panel' : 'Show chat panel'}
              aria-expanded={isChatOpen}
            />
            <EndCallButton
              onHangUp={async () => {
                // Leaving should release the webcam, not just hide the tile.
                camera.turnOff();
                setHasLeft(true);
              }}
              showLabel={!isNarrow}
              styles={controlButtonStyles}
            />
          </ControlBar>
        </div>

        <RealTimeTextModal
          showModal={showRttModal}
          onDismissModal={() => setShowRttModal(false)}
          onStartRealTimeText={() => {
            setIsRttOn(true);
            setShowRttModal(false);
          }}
        />

        <p className="app__footnote">
          Camera video stays in your browser. No Azure Communication Services connection, no
          tokens, no backend.
        </p>
      </div>
    </FluentThemeProvider>
  );
};

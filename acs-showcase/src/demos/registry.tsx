import { useCallback, useMemo, useState } from 'react';
import {
  CameraButton,
  CaptionsBanner,
  ControlBar,
  DevicesButton,
  EndCallButton,
  MessageThread,
  MicrophoneButton,
  ParticipantList,
  RealTimeTextModal,
  ScreenShareButton,
  StartRealTimeTextButton,
  SendBox,
  TypingIndicator,
  VideoGallery,
  type ChatMessage,
  type ControlBarLayout,
  type OptionsDevice,
  type ParticipantListParticipant,
  type SystemMessage,
  type VideoGalleryLayout,
} from '@azure/communication-react';
import {
  LOCAL_DISPLAY_NAME,
  LOCAL_USER_ID,
  SEED_PARTICIPANTS,
  buildRemoteParticipants,
} from '../data/participants';
import { SEED_MESSAGES } from '../data/messages';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useRealTimeTextFeed } from '../hooks/useRealTimeTextFeed';

export interface Demo {
  /** Slug used as ?component= in the iframe URL. */
  slug: string;
  /** Component name, shown as the demo's heading. */
  name: string;
  /** One line on what this component is responsible for. */
  note: string;
  render: (isDark: boolean) => JSX.Element;
}

/** A labelled row of buttons for switching a prop — plain HTML, not ACS. */
const Switcher = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
}): JSX.Element => (
  <div className="demo-switcher">
    <span className="demo-switcher__label">{label}</span>
    <div className="demo-switcher__options" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="demo-chip"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

/* ── VideoGallery ─────────────────────────────────────────────────────────── */

const GALLERY_LAYOUTS = ['floatingLocalVideo', 'default', 'speaker'] as const;

const VideoGalleryDemo = ({ isDark }: { isDark: boolean }): JSX.Element => {
  const [layout, setLayout] = useState<(typeof GALLERY_LAYOUTS)[number]>('floatingLocalVideo');
  const remoteParticipants = useMemo(() => buildRemoteParticipants(SEED_PARTICIPANTS, isDark), [isDark]);

  return (
    <>
      <Switcher
        label="layout"
        value={layout}
        options={GALLERY_LAYOUTS}
        onChange={(next) => setLayout(next)}
      />
      <div className="demo-stage demo-stage--fill">
        <VideoGallery
          layout={layout as VideoGalleryLayout}
          localParticipant={{
            userId: LOCAL_USER_ID,
            displayName: LOCAL_DISPLAY_NAME,
            isMuted: false,
            videoStream: { isAvailable: false },
          }}
          remoteParticipants={remoteParticipants}
          dominantSpeakers={['p-nadia']}
          remoteVideoTileMenu={false}
          showMuteIndicator
        />
      </div>
    </>
  );
};

/* ── ControlBar ───────────────────────────────────────────────────────────── */

const BAR_LAYOUTS = [
  'horizontal',
  'vertical',
  'dockedTop',
  'dockedBottom',
  'dockedLeft',
  'dockedRight',
  'floatingTop',
  'floatingBottom',
  'floatingLeft',
  'floatingRight',
] as const;

const ControlBarDemo = (): JSX.Element => {
  const [layout, setLayout] = useState<(typeof BAR_LAYOUTS)[number]>('floatingBottom');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  return (
    <>
      <Switcher label="layout" value={layout} options={BAR_LAYOUTS} onChange={setLayout} />
      <div className="demo-switcher">
        <span className="demo-switcher__label">labels</span>
        <div className="demo-switcher__options" role="group" aria-label="labels">
          <button type="button" className="demo-chip" aria-pressed={showLabels} onClick={() => setShowLabels(true)}>
            shown
          </button>
          <button type="button" className="demo-chip" aria-pressed={!showLabels} onClick={() => setShowLabels(false)}>
            icon only
          </button>
        </div>
      </div>
      {/* The bar's floating and docked layouts position themselves absolutely,
          so they need a positioned container to sit inside. */}
      <div className="demo-stage demo-stage--fill demo-stage--bar">
        <ControlBar layout={layout as ControlBarLayout}>
          <CameraButton
            checked={isCameraOn}
            showLabel={showLabels}
            onToggleCamera={async () => setIsCameraOn((on) => !on)}
          />
          <MicrophoneButton
            checked={isMicOn}
            showLabel={showLabels}
            onToggleMicrophone={async () => setIsMicOn((on) => !on)}
          />
          <ScreenShareButton
            checked={isSharing}
            showLabel={showLabels}
            onToggleScreenShare={async () => setIsSharing((on) => !on)}
          />
          <EndCallButton showLabel={showLabels} onHangUp={async () => undefined} />
        </ControlBar>
      </div>
    </>
  );
};

/* ── MessageThread ────────────────────────────────────────────────────────── */

const MessageThreadDemo = (): JSX.Element => (
  <div className="demo-stage demo-stage--fill demo-stage--pad">
    <MessageThread
      userId={LOCAL_USER_ID}
      messages={SEED_MESSAGES}
      showMessageDate
      showMessageStatus
      participantCount={7}
    />
  </div>
);

/* ── SendBox + TypingIndicator ────────────────────────────────────────────── */

const SendBoxDemo = (): JSX.Element => {
  const [sent, setSent] = useState<(ChatMessage | SystemMessage)[]>([]);

  const onSend = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }
    setSent((previous) => [
      ...previous,
      {
        messageType: 'chat',
        messageId: `sent-${Date.now()}`,
        contentType: 'text',
        senderId: LOCAL_USER_ID,
        senderDisplayName: LOCAL_DISPLAY_NAME,
        content: trimmed,
        createdOn: new Date(),
        mine: true,
        attached: false,
        status: 'seen',
      },
    ]);
  }, []);

  return (
    <div className="demo-stage demo-stage--fill demo-stage--pad demo-stage--column">
      <div className={`demo-sendbox-thread${sent.length === 0 ? ' demo-sendbox-thread--empty' : ''}`}>
        {sent.length === 0 ? (
          <p className="demo-empty">Type below — what you send lands here and nowhere else.</p>
        ) : (
          <MessageThread userId={LOCAL_USER_ID} messages={sent} showMessageDate />
        )}
      </div>
      <TypingIndicator typingUsers={[{ userId: 'p-priya', displayName: 'Priya Raman' }]} />
      <SendBox onSendMessage={onSend} supportNewline strings={{ placeholderText: 'Type a message' }} />
    </div>
  );
};

/* ── ParticipantList ──────────────────────────────────────────────────────── */

/**
 * ParticipantList reads `isMuted` and `isScreenSharing` off each participant to
 * decide which trailing icons to draw, but the public
 * {@link ParticipantListParticipant} type does not declare them — in a real app
 * they arrive from the calling selector. They are added here for the same effect.
 */
type RosterParticipant = ParticipantListParticipant & {
  isMuted?: boolean;
  isScreenSharing?: boolean;
};

const ROSTER: RosterParticipant[] = [
  { userId: LOCAL_USER_ID, displayName: LOCAL_DISPLAY_NAME, isRemovable: false, isMuted: false },
  ...SEED_PARTICIPANTS.map((participant, index) => ({
    userId: participant.userId,
    displayName: participant.displayName,
    isRemovable: true,
    isMuted: participant.isMuted,
    isScreenSharing: index === 0,
  })),
];

const ParticipantListDemo = (): JSX.Element => {
  const [roster, setRoster] = useState<RosterParticipant[]>(ROSTER);

  return (
    <div className="demo-stage demo-stage--fill demo-stage--pad">
      <ParticipantList
        participants={roster}
        myUserId={LOCAL_USER_ID}
        onRemoveParticipant={(userId) =>
          setRoster((current) => current.filter((participant) => participant.userId !== userId))
        }
      />
    </div>
  );
};

/* ── Device buttons ───────────────────────────────────────────────────────── */

const DeviceButtonsDemo = (): JSX.Element => {
  const { cameras, microphones } = useMediaDevices();
  const [selectedCamera, setSelectedCamera] = useState<OptionsDevice | undefined>();
  const [selectedMicrophone, setSelectedMicrophone] = useState<OptionsDevice | undefined>();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const camera = selectedCamera ?? cameras[0];
  const microphone = selectedMicrophone ?? microphones[0];

  return (
    <div className="demo-stage demo-stage--fill demo-stage--center">
      <ControlBar layout="horizontal">
        <CameraButton
          checked={isCameraOn}
          showLabel
          enableDeviceSelectionMenu
          cameras={cameras}
          selectedCamera={camera}
          onSelectCamera={async (device) => setSelectedCamera(device)}
          onToggleCamera={async () => setIsCameraOn((on) => !on)}
        />
        <MicrophoneButton
          checked={isMicOn}
          showLabel
          enableDeviceSelectionMenu
          microphones={microphones}
          selectedMicrophone={microphone}
          onSelectMicrophone={async (device) => setSelectedMicrophone(device)}
          onToggleMicrophone={async () => setIsMicOn((on) => !on)}
        />
        <DevicesButton
          showLabel
          cameras={cameras}
          microphones={microphones}
          selectedCamera={camera}
          selectedMicrophone={microphone}
          onSelectCamera={async (device) => setSelectedCamera(device)}
          onSelectMicrophone={async (device) => setSelectedMicrophone(device)}
        />
      </ControlBar>
    </div>
  );
};

/* ── Real-Time Text ───────────────────────────────────────────────────────── */

const RealTimeTextDemo = (): JSX.Element => {
  const [isOn, setIsOn] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const feed = useRealTimeTextFeed(isOn);
  // On by default here, because an embedded frame showing an empty banner does
  // not demonstrate anything. Turning it off and back on still runs the real
  // consent modal, which is the part of this worth seeing.

  return (
    <>
      <div className={`demo-stage demo-stage--banner demo-stage--pad${isOn ? '' : ' demo-stage--idle'}`}>
        {!isOn && (
          <p className="demo-empty">
            Off by default. Turning it on asks every participant first, because once RTT is on it
            stays on for the rest of the call and cannot be switched back off.
          </p>
        )}
        <CaptionsBanner
          captions={[]}
          isRealTimeTextOn={isOn}
          realTimeTexts={{
            completedMessages: feed.completedRtt,
            currentInProgress: feed.inProgressRtt,
            myInProgress: feed.myRtt,
          }}
          onSendRealTimeText={isOn ? feed.sendMyRtt : undefined}
          latestLocalRealTimeText={feed.myRtt}
          captionsOptions={{ height: 'default' }}
        />
      </div>
      <div className="demo-switcher">
        <StartRealTimeTextButton
          showLabel
          isRealTimeTextOn={isOn}
          onStartRealTimeText={() => setShowModal(true)}
        />
        {/* The library's button disables itself once RTT is on, because in the
            product it genuinely cannot be switched off again. That is the point
            of the feature, so the reset is a plain control rather than a fake
            library one. */}
        {isOn && (
          <button
            type="button"
            className="demo-chip"
            onClick={() => {
              setIsOn(false);
              setShowModal(false);
            }}
          >
            Start over, to see the consent step
          </button>
        )}
      </div>
      <RealTimeTextModal
        showModal={showModal}
        onDismissModal={() => setShowModal(false)}
        onStartRealTimeText={() => {
          setIsOn(true);
          setShowModal(false);
        }}
      />
    </>
  );
};

/* ── registry ─────────────────────────────────────────────────────────────── */

export const DEMOS: Demo[] = [
  {
    slug: 'video-gallery',
    name: 'VideoGallery',
    note: 'The grid, the overflow row and the local tile. Camera-off participants keep their place as initials; dominant speakers hold the visible slots.',
    render: (isDark) => <VideoGalleryDemo isDark={isDark} />,
  },
  {
    slug: 'control-bar',
    name: 'ControlBar',
    note: 'Ten preset layouts, so the bar can sit on any edge of any container. Labels come off for narrow surfaces; the tooltip carries the name once they do.',
    render: () => <ControlBarDemo />,
  },
  {
    slug: 'message-thread',
    name: 'MessageThread',
    note: 'Grouping, timestamps, read receipts and system messages, driven entirely by the message array you hand it.',
    render: () => <MessageThreadDemo />,
  },
  {
    slug: 'send-box',
    name: 'SendBox + TypingIndicator',
    note: 'The composer and the presence line beneath it. Nothing here is wired to a chat thread — what you type stays in this frame.',
    render: () => <SendBoxDemo />,
  },
  {
    slug: 'participant-list',
    name: 'ParticipantList',
    note: 'The roster, with mute and screen-share indicators and a per-participant menu. Removing someone here really removes them from this frame.',
    render: () => <ParticipantListDemo />,
  },
  {
    slug: 'rtt',
    name: 'RealTimeText',
    note: 'Text appearing as it is typed, in the main stage rather than a side panel. Starting it asks for consent first, because once it is on it stays on for everyone.',
    render: () => <RealTimeTextDemo />,
  },
  {
    slug: 'device-buttons',
    name: 'Device selection',
    note: 'CameraButton and MicrophoneButton as split buttons, plus DevicesButton. Populated from your real devices — open a menu to see them.',
    render: () => <DeviceButtonsDemo />,
  },
];

export const findDemo = (slug: string | null): Demo | undefined =>
  DEMOS.find((demo) => demo.slug === slug);

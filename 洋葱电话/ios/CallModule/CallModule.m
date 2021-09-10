//
//  CallModule.m
//  voiceCall_rn
//
//  Created by tim on 8/17/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CallModule.h"
#import <React/RCTLog.h>

@import AVFoundation;
@import PushKit;
@import TwilioVoice;
@import UserNotifications;

@interface CallModule () <PKPushRegistryDelegate, TVONotificationDelegate, TVOCallDelegate, AVAudioPlayerDelegate>
@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, strong) NSString *current_accessToken;
@property (nonatomic, strong) NSString *deviceTokenString;

@property (nonatomic, strong) TVOCallInvite *callInvite;
@property (nonatomic, strong) TVOCall *call;

@property (nonatomic, strong) void(^incomingPushCompletionCallback)(void);
@property (nonatomic, strong) AVAudioPlayer *ringtonePlayer;
typedef void (^RingtonePlaybackCallback)(void);
@property (nonatomic, strong) RingtonePlaybackCallback ringtonePlaybackCallback;

@end

@implementation CallModule
{
  bool hasListeners;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registeNotificition:(NSString *)accessToken)
{
  RCTLogInfo(@"register Notificition finish");
  
  self.current_accessToken = accessToken;
  
  self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
  self.voipRegistry.delegate = self;
  self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];

}

// 在添加第一个监听函数时触发
-(void)startObserving {
  hasListeners = YES;
}

-(void)stopObserving {
  hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EventCallComing",
           @"EventCallDidStartRinging",
           @"EventCallDidConnect",
           @"EventCallReconnecting",
           @"EventCallReconnected",
           @"EventCallDidFailed",
           @"EventCallDisconnected",];
}

#pragma mark - StatusCall
// 取消来电电话
RCT_EXPORT_METHOD(rejectCall){
  [self.callInvite reject];
  self.callInvite = nil;
}
// 忽略来电电话
RCT_EXPORT_METHOD(ignoreCall){
  self.callInvite = nil;
}
// 忽略来电电话
RCT_EXPORT_METHOD(acceptCall){
  TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:self.callInvite];
  self.call = [self.callInvite acceptWithOptions:acceptOptions delegate:self];
  self.callInvite = nil;
}
// 后台通知
RCT_EXPORT_METHOD(notification_bg_native:(NSString*)title msg:(NSString*)msg){
  // If the application is not in the foreground, post a local notification
  if ([[UIApplication sharedApplication] applicationState] != UIApplicationStateActive) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    UNMutableNotificationContent *content = [UNMutableNotificationContent new];
    content.title = title;
    content.body = msg;
    content.sound = [UNNotificationSound defaultSound];
    
    UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:@"VoiceLocaNotification"
                                                                          content:content
                                                                          trigger:nil];
    
    [center addNotificationRequest:request withCompletionHandler:^(NSError *error) {
      RCTLogInfo(@"Failed to add notification request: %@", error);
    }];
  }
}


#pragma mark - PKPushRegistryDelegate
// 注册deviceToken
- (void)pushRegistry:(nonnull PKPushRegistry *)registry didUpdatePushCredentials:(nonnull PKPushCredentials *)credentials forType:(nonnull PKPushType)type {
  
  RCTLogInfo(@"pushRegistry:didUpdatePushCredentials:forType:");
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    RCTLogInfo(@"PushCredentials: %@", credentials.token);
    
    self.deviceTokenString = [credentials.token description];
    NSString *accessToken = self.current_accessToken;
    
    [TwilioVoice registerWithAccessToken:accessToken deviceToken:self.deviceTokenString completion:^(NSError *error) {
      if (error) {
        RCTLogInfo(@"An error occurred while registering: %@", [error localizedDescription]);
      } else {
        RCTLogInfo(@"Successfully registered for VoIP push notifications.");
      }
    }];
  }
}
// 取消注册deviceToken
- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
  RCTLogInfo(@"pushRegistry:didInvalidatePushTokenForType:");
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    NSString *accessToken = self.current_accessToken;
    
    [TwilioVoice unregisterWithAccessToken:accessToken deviceToken:self.deviceTokenString completion:^(NSError * _Nullable error) {
      if (error) {
        RCTLogInfo(@"An error occurred while unregistering: %@", [error localizedDescription]);
      }
      else {
        RCTLogInfo(@"Successfully unregistered for VoIP push notifications.");
      }
    }];
    self.deviceTokenString = nil;
  }
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type {
  RCTLogInfo(@"pushRegistry:didReceiveIncomingPushWithPayload:forType:");
  if ([type isEqualToString:PKPushTypeVoIP]) {
    if (![TwilioVoice handleNotification:payload.dictionaryPayload delegate:self]) {
      RCTLogInfo(@"This is not a valid Twilio Voice notification.");
    }
  }
}

/**
 * This delegate method is available on iOS 11 and above. Call the completion handler once the
 * notification payload is passed to the `TwilioVoice.handleNotification()` method.
 */
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  RCTLogInfo(@"pushRegistry:didReceiveIncomingPushWithPayload:forType:withCompletionHandler:");
  
  // Save for later when the notification is properly handled.
  self.incomingPushCompletionCallback = completion;
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    if (![TwilioVoice handleNotification:payload.dictionaryPayload delegate:self]) {
      RCTLogInfo(@"This is not a valid Twilio Voice notification.");
    }
  }
}

- (void)incomingPushHandled {
  if (self.incomingPushCompletionCallback) {
    self.incomingPushCompletionCallback();
    self.incomingPushCompletionCallback = nil;
  }
}

#pragma mark - TVONotificationDelegate

- (void)callInviteReceived:(nonnull TVOCallInvite *)callInvite {
  RCTLogInfo(@"callInviteReceived:");
  NSString *status = @"call_coming";
  
  if (self.callInvite) {
    RCTLogInfo(@"A CallInvite is already in progress. Ignoring the incoming CallInvite from %@", callInvite.from);
    status = @"call_has_invite";
  }
  if (self.call && self.call.state == TVOCallStateConnected) {
    RCTLogInfo(@"Already an active call. Ignoring incoming CallInvite from %@", callInvite.from);
    status = @"call_has_connect";
  }
  
  if (hasListeners) { // Only send events if anyone is listening
    [self sendEventWithName:@"EventCallComing"
                       body:@{@"from": callInvite.from,
                              @"status": status}];
  }
  
  if (!self.callInvite){
    self.callInvite = callInvite;
  }
//  if ([status isEqualToString:@"call_coming"]){
//    self.callInvite = callInvite;
//  }
  
  [self incomingPushHandled];
}

- (void)cancelledCallInviteReceived:(nonnull TVOCancelledCallInvite *)cancelledCallInvite {
  RCTLogInfo(@"cancelledCallInviteReceived:");
  
  if (!self.callInvite ||
      ![self.callInvite.callSid isEqualToString:cancelledCallInvite.callSid]) {
    RCTLogInfo(@"No matching pending CallInvite. Ignoring the Cancelled CallInvite");
    return;
  }
  
//  [self stopIncomingRingtone];
//  [self playDisconnectSound];
  
  self.callInvite = nil;
  
  [[UNUserNotificationCenter currentNotificationCenter] removeAllPendingNotificationRequests];
  
  [self incomingPushHandled];
}

#pragma mark - TVOCallDelegate
- (void)callDidStartRinging:(TVOCall *)call {
  NSLog(@"callDidStartRinging:");
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidStartRinging" body:@{}];
  }
}

- (void)callDidConnect:(TVOCall *)call {
  NSLog(@"callDidConnect:");
  self.call = call;

  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidConnect" body:@{}];
  }
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
  NSLog(@"Call is reconnecting");
  if (hasListeners) {
    [self sendEventWithName:@"EventCallReconnecting" body:@{}];
  }
}

- (void)callDidReconnect:(TVOCall *)call {
  NSLog(@"Call reconnected");
  if (hasListeners) {
    [self sendEventWithName:@"EventCallReconnected" body:@{}];
  }
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
  NSLog(@"Call failed to connect: %@", error);
  [self callDisconnected];
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidFailed" body:@{}];
  }
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
  if (error) {
    NSLog(@"Call failed: %@", error);
  } else {
    NSLog(@"Call disconnected");
  }
  [self callDisconnected];
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDisconnected" body:@{}];
  }
}

- (void)callDisconnected {
  self.call = nil;
  
}

#pragma mark - AVAudioSession

RCT_EXPORT_METHOD(toggleAudioRoute:(BOOL)toSpeaker) {
  // The mode set by the Voice SDK is "VoiceChat" so the default audio route is the built-in receiver. Use port override to switch the route.
  TVODefaultAudioDevice *audioDevice = (TVODefaultAudioDevice *)TwilioVoice.audioDevice;
  audioDevice.block =  ^ {
    // We will execute `kDefaultAVAudioSessionConfigurationBlock` first.
    kTVODefaultAVAudioSessionConfigurationBlock();
    
    // Overwrite the audio route
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;
    if (toSpeaker) {
      if (![session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error]) {
        NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
      }
    } else {
      if (![session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error]) {
        NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
      }
    }
  };
  audioDevice.block();
}

#pragma mark - Ringtone player & AVAudioPlayerDelegate
- (void)playOutgoingRingtone:(RingtonePlaybackCallback)completion{
  self.ringtonePlaybackCallback = completion;
  
  NSString *ringtonePath = [[NSBundle mainBundle] pathForResource:@"outgoing" ofType:@"wav"];
  if ([ringtonePath length] <= 0) {
    NSLog(@"Can't find outgoing sound file");
    if (self.ringtonePlaybackCallback) {
      self.ringtonePlaybackCallback();
    }
    return;
  }
  
  self.ringtonePlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL URLWithString:ringtonePath] error:nil];
  self.ringtonePlayer.delegate = self;
  
  [self playRingtone];
}

- (void)playIncomingRingtone {
  NSString *ringtonePath = [[NSBundle mainBundle] pathForResource:@"incoming" ofType:@"wav"];
  if ([ringtonePath length] <= 0) {
    NSLog(@"Can't find incoming sound file");
    return;
  }
  
  self.ringtonePlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL URLWithString:ringtonePath] error:nil];
  self.ringtonePlayer.delegate = self;
  self.ringtonePlayer.numberOfLoops = -1;
  
  [self playRingtone];
}

- (void)stopIncomingRingtone {
  if (!self.ringtonePlayer.isPlaying) {
    return;
  }
  
  [self.ringtonePlayer stop];
  NSError *error = nil;
  if (![[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord
                                              error:&error]) {
    NSLog(@"Failed to reset AVAudioSession category: %@", [error localizedDescription]);
  }
}

- (void)playDisconnectSound {
  NSString *ringtonePath = [[NSBundle mainBundle] pathForResource:@"disconnect" ofType:@"wav"];
  if ([ringtonePath length] <= 0) {
    NSLog(@"Can't find disconnect sound file");
    return;
  }
  
  self.ringtonePlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL URLWithString:ringtonePath] error:nil];
  self.ringtonePlayer.delegate = self;
  self.ringtonePlaybackCallback = nil;
  
  [self playRingtone];
}

- (void)playRingtone {
  NSError *error = nil;
  if (![[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback
                                              error:&error]) {
    NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
  }
  
  self.ringtonePlayer.volume = 1.0f;
  [self.ringtonePlayer play];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag {
  if (self.ringtonePlaybackCallback) {
    __weak typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong typeof(self) strongSelf = weakSelf;
      strongSelf.ringtonePlaybackCallback();
    });
    
    NSError *error = nil;
    if (![[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord
                                                error:&error]) {
      NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
    }
  }
}


@end

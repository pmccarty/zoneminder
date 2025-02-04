#ifndef ZM_DECODER_THREAD_H
#define ZM_DECODER_THREAD_H

#include <atomic>
#include <memory>
#include <thread>

class Monitor;

class DecoderThread {
 public:
  explicit DecoderThread(Monitor* monitor);
  //explicit DecoderThread(std::shared_ptr<Monitor> monitor);
  ~DecoderThread();
  DecoderThread(DecoderThread &rhs) = delete;
  DecoderThread(DecoderThread &&rhs) = delete;

  void Stop() { terminate_ = true; }

 private:
  void Run();

  Monitor* monitor_;
  //std::shared_ptr<Monitor> monitor_;
  std::atomic<bool> terminate_;
  std::thread thread_;
};

#endif

"""Closed vocabularies shared by the engine and the database. Pure: no IO."""

from __future__ import annotations

from enum import StrEnum


class ExperienceKey(StrEnum):
    """Store experience attributes (docs/04 section 2). A closed registry.

    The `branch_attributes` check constraint mirrors this list; adding a key needs a migration.
    """

    PARKING = "parking"
    TROLLEYS = "trolleys"
    SELF_SCAN = "self_scan"
    CHECKOUT_LANES = "checkout_lanes"
    QUIET_HOURS = "quiet_hours"
    ACCESSIBILITY = "accessibility"
    RETURN_MACHINE = "return_machine"
    CLICK_COLLECT = "click_collect"
    FRESH_DELIVERY = "fresh_delivery"
    IN_STORE_BAKERY = "in_store_bakery"
    EV_CHARGING = "ev_charging"

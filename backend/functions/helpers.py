import pandas as pd
import natsort
import math


def get_fish_ids(df):
    """
    Retrieves unique values in column subject.

    :param df: pandas dataframe
    :return: sorted list of unique subjects
    """
    fish_ids = df.subject.unique().tolist()
    fish_ids = [x for x in fish_ids if str(x) != "nan"]
    fish_ids = natsort.natsorted(fish_ids)
    return fish_ids


def get_unique_modifier1s(df):
    """
    Retrieves unique values in column modifier.

    :param df: pandas dataframe
    :return: sorted list of unique modifiers
    """
    modifier_1s = df.modifier_1.unique().tolist()
    modifier_1s = [x for x in modifier_1s if str(x) != "nan"]
    modifier_1s = natsort.natsorted(modifier_1s)
    return modifier_1s


def get_total_time(df, fish_ids):
    """
    Retrieves the total and average time a behavior is shown for specified subjects.

    :param df: pandas dataframe
    :param fish_ids: subjects to operate on
    :return: list of 3-tuples (behavior, total time, average time)
    """
    df = df[["time", "subject", "chosen_data", "status"]]
    behavior_ids = df.chosen_data.unique().tolist()
    time_list = []
    for behavior in behavior_ids:
        behavior_df = df[df.chosen_data == behavior]
        total = 0
        for fish in fish_ids:
            id_frame = behavior_df[behavior_df.subject == fish]
            stop_total = id_frame[id_frame.status == "STOP"].time.sum()
            start_total = id_frame[id_frame.status == "START"].time.sum()
            total = total + stop_total - start_total
        time_list.append((behavior, total))
    return time_list


def get_row_index(df, values):
    """
    Gets index positions of specified values in dataframe.

    :param df: pandas dataframe
    :param values: data structure with values to search
    :return: list of row indices
    """
    for value in values:
        listOfPos = list()
        # Get bool dataframe with True at positions where the given value exists
        result = df.isin([value])
        # Get list of columns that contains the value
        seriesObj = result.any()
        columnNames = list(seriesObj[seriesObj == True].index)
        # Iterate over list of columns and fetch the rows indexes where value exists
        for col in columnNames:
            rows = list(result[col][result[col] == True].index)
            for row in rows:
                listOfPos.append(row)
                return listOfPos
        # Return a list of tuples indicating the positions of value in the dataframe
    return listOfPos


def try_upload(raw_data):
    """
    Tries to handle a possible data upload and returns appropiate success or error status code with message.

    :param raw_data: arbitrary file
    :return: 2-tuple (return message, Bool) indicating if data could be handled or why not
    """
    # hacky solution for loading example data
    if raw_data == "example1":
        df = pd.read_excel(r"./public/example_data/1.xlsx")
    elif raw_data == "example2":
        df = pd.read_excel(r"./public/example_data/2.xlsx")
    elif raw_data == "example3":
        df = pd.read_excel(r"./public/example_data/3.xlsx")

    # load data depending on file type
    else:
        try:
            df = pd.read_csv(raw_data)
        except:
            df = pd.read_excel(raw_data)
    # remove meta information before column headers
    try:
        header_row_index = get_row_index(
            df, ["Time", "time", "Subject", "subject", "Status", "Behavior"]
        )[0]
        df = df.iloc[header_row_index:]
        df.columns = df.iloc[0]
        df = df.iloc[1:]
    except:
        pass

    try:
        # make column headers lowercase and substitute whitespace
        df.columns = [x.lower() for x in df.columns]
        df.columns = df.columns.str.replace(" ", "_")

        # rename modifier column if it is named 'modifiers'
        if "modifiers" in df.columns and "modifier_1" not in df.columns:
            df.rename(columns={"modifiers": "modifier_1"}, inplace=True)
        if "modifier" in df.columns and "modifier_1" not in df.columns:
            df.rename(columns={"modifier": "modifier_1"}, inplace=True)

        # if user has BORIS exported data as 'aggregated events' change syntax
        if "start_(s)" in df.columns and "time" not in df.columns:
            # split into behavior starts and stops and rename accordingly
            df_starts = df.copy(deep=True)
            df_starts.rename(columns={"start_(s)": "time"}, inplace=True)
            df_starts["status"] = "START"
            # drop unused rows
            df_starts.drop(["stop_(s)", "duration_(s)"], axis=1, inplace=True)

            df_stops = df.copy(deep=True)
            df_stops.rename(columns={"stop_(s)": "time"}, inplace=True)
            df_stops["status"] = "STOP"
            # drop unused rows
            df_stops.drop(["start_(s)", "duration_(s)"], axis=1, inplace=True)

            df = df_starts.append(df_stops)
            df.time = df.time.astype(float)
            df = df.sort_values(by="time")
            df.reset_index(drop=True, inplace=True)
    except:
        return ("could not parse column headers", False)

    response = ""
    success = True
    try:
        # return error message and instructions if time, subject, behavior or status are not present
        if "time" not in df.columns:
            response += 'Required column "Time" is missing\n'
            success = False
        if "subject" not in df.columns:
            response += 'Required column "Subject" is missing\n'
            success = False
        if "behavior" not in df.columns:
            response += 'Required column "Behavior" is missing\n'
            success = False
        if df.time.isnull().values.any():
            response += 'Column "time" must not have any empty cells\n'
            success = False
        if df.behavior.isnull().values.any():
            response += 'Column "behavior" must not have any empty cells\n'
            success = False
    except:
        return ("Could not parse dataset", False)

    return (response, success)


def handle_upload(raw_data):
    """
    Cleans data upload and fills in missing values which are needed for proper data handling.

    :param raw_data: arbitrary file
    :return: pandas dataframe generated from cleaned raw data
    """
    # hacky solution for loading example data
    if raw_data == "example1":
        df = pd.read_excel(r"./public/example_data/1.xlsx")
    elif raw_data == "example2":
        df = pd.read_excel(r"./public/example_data/2.xlsx")
    elif raw_data == "example3":
        df = pd.read_excel(r"./public/example_data/3.xlsx")

    # load data depending on file type
    else:
        try:
            df = pd.read_csv(raw_data)
        except:
            df = pd.read_excel(raw_data)

    # remove meta information before column headers
    try:
        header_row_index = get_row_index(
            df, ["Time", "time", "Subject", "subject", "Status", "Behavior"]
        )[0]
        df = df.iloc[header_row_index:]
        df.columns = df.iloc[0]
        df = df.iloc[1:]
    except:
        pass

    # make column headers lowercase and substitute whitespace
    df.columns = [x.lower() for x in df.columns]
    df.columns = df.columns.str.replace(" ", "_")

    # rename modifier column if it is named 'modifiers'
    if "modifiers" in df.columns and "modifier_1" not in df.columns:
        df.rename(columns={"modifiers": "modifier_1"}, inplace=True)
    if "modifier" in df.columns and "modifier_1" not in df.columns:
        df.rename(columns={"modifier": "modifier_1"}, inplace=True)

    # if user has BORIS exported data as 'aggregated events' change syntax
    if "start_(s)" in df.columns and "time" not in df.columns:
        # split into behavior starts and stops and rename accordingly
        df_starts = df.copy(deep=True)
        df_starts.rename(columns={"start_(s)": "time"}, inplace=True)
        df_starts["status"] = "START"
        # drop unused rows
        df_starts.drop(["stop_(s)", "duration_(s)"], axis=1, inplace=True)

        df_stops = df.copy(deep=True)
        df_stops.rename(columns={"stop_(s)": "time"}, inplace=True)
        df_stops["status"] = "STOP"
        # drop unused rows
        df_stops.drop(["start_(s)", "duration_(s)"], axis=1, inplace=True)

        df = df_starts.append(df_stops)
        df.time = df.time.astype(float)
        df = df.sort_values(by="time")
        df.reset_index(drop=True, inplace=True)

    # convert time to float if excel gives string objects
    df.time = df.time.astype(float)

    # add missing columns
    if "modifier_1" not in df.columns:
        df["modifier_1"] = "unknown"
    if "behavioral_category" not in df.columns:
        df["behavioral category "] = "No behavioral categories present"
    if "status" not in df.columns:
        df["status"] = "unknown"
    if "total_length" not in df.columns:
        df["total_length"] = df["time"].iloc[-1]

    # fill empty values with some 'unknown' value
    df.behavioral_category.fillna("unknown", inplace=True)

    return df

def determine_ytick_frequency(max_val):
    if max_val < 11:
        return 1
    elif max_val < 26:
        return 2
    elif max_val < 51:
        return 5
    elif max_val < 101:
        return 10
    elif max_val < 201:
        return 20
    else:
        return 50
    
# Custom sorting function to handle alphanumerical sorting
def alphanum_key(s):
    import re
    return [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', s)]